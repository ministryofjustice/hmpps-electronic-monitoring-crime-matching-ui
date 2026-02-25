import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import {
  LocationsLayer,
  TracksLayer,
  CirclesLayer,
  TextLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'

import Feature from 'ol/Feature'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { Point, Circle as CircleGeom } from 'ol/geom'
import { Fill, Stroke, Style, RegularShape } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'
import { createEmpty, extend as extendExtent, isEmpty as isEmptyExtent } from 'ol/extent'
import { queryElement } from '../../utils/utils'

type WearerPosition = {
  positionType: 'wearer'
  latitude: number
  longitude: number
  precision: number
  timestamp: string
  sequenceLabel: string
  deviceWearerId: string
  deviceId: number
}

type CrimePosition = {
  positionType: 'crime'
  latitude: number
  longitude: number
  radiusMeters: number
}

type ProximityAlertMapPosition = WearerPosition | CrimePosition

type Extent = ReturnType<typeof createEmpty>
type SourceWithExtent = { getExtent?: () => Extent }
type LayerWithSource = {
  getSource?: () => SourceWithExtent | undefined
  setVisible?: (visible: boolean) => void
}

type WearerLayers = {
  locations?: LayerWithSource
  tracks?: LayerWithSource
  circles?: LayerWithSource
  labels?: LayerWithSource
}

type CircleInput = {
  latitude: number
  longitude: number
  precision: number
}

type PresetParam = 'default' | 'image-2' | 'wearer-image-1' | 'wearer-image-2'

type Image1CaptureState = {
  mapWidthPx: number
  mapHeightPx: number
  devicePixelRatio: number
  view: {
    center: [number, number]
    resolution: number
    rotation: number
  }
}

const palette = ['rgba(255, 214, 10, 1)', 'rgba(139, 69, 19, 1)']

function getPresetFromUrl(): PresetParam | null {
  const params = new URLSearchParams(window.location.search)
  const preset = params.get('preset')
  if (preset === 'default' || preset === 'image-2' || preset === 'wearer-image-1' || preset === 'wearer-image-2')
    return preset
  return null
}

function getWearerIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const wearerId = params.get('wearerId')
  return wearerId || null
}

function getWearerIdsFromUrl(): string[] | null {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('wearerIds')
  if (!raw) return null
  const ids = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return ids.length ? ids : null
}

function isHeadlessCapture(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.get('headless') === 'true'
}

function getHeadlessMapSizeFromUrl(): { widthPx: number; heightPx: number } | null {
  const params = new URLSearchParams(window.location.search)
  const w = params.get('mapW')
  const h = params.get('mapH')
  if (!w || !h) return null
  const widthPx = Number(w)
  const heightPx = Number(h)
  if (!Number.isFinite(widthPx) || !Number.isFinite(heightPx) || widthPx <= 0 || heightPx <= 0) return null
  return { widthPx, heightPx }
}

const addCrimeLayers = (emMap: EmMap, crime: CrimePosition): Coordinate => {
  const map = emMap.olMapInstance!
  const centre = fromLonLat([crime.longitude, crime.latitude])

  const crimeMarker = new Feature({
    geometry: new Point(centre),
  })

  crimeMarker.setStyle(
    new Style({
      image: new RegularShape({
        points: 4,
        radius: 10,
        angle: Math.PI / 4,
        fill: new Fill({ color: 'rgba(220, 0, 0, 1)' }),
        stroke: new Stroke({ color: 'rgba(255, 255, 255, 1)', width: 2 }),
      }),
    }),
  )

  const crimeMarkerLayer = new VectorLayer({
    source: new VectorSource({ features: [crimeMarker] }),
  })
  crimeMarkerLayer.setZIndex(10)
  map.addLayer(crimeMarkerLayer)

  const circlePos: CircleInput = {
    latitude: crime.latitude,
    longitude: crime.longitude,
    precision: crime.radiusMeters,
  }

  emMap.addLayer(
    new CirclesLayer({
      id: 'crime-radius',
      title: 'crime-radius',
      zIndex: 1,
      visible: true,
      style: {
        fill: 'rgba(0, 0, 0, 0.12)',
        stroke: { color: 'rgba(0, 0, 0, 0.45)', width: 2 },
      },
      positions: [circlePos],
    }),
  )

  return centre
}

const setCrimeDefaultView = (emMap: EmMap, centre: Coordinate) => {
  const map = emMap.olMapInstance!
  map.getView().setCenter(centre)
  map.getView().setZoom(16.5)
}

const applyHideZoomSliderAndMoveCompass = (emMap: EmMap) => {
  const root = emMap.shadowRoot
  if (!root) return

  const zoomSlider = root.querySelector<HTMLElement>('.ol-zoom')
  if (zoomSlider) zoomSlider.style.display = 'none'

  const zoomSliderThumb = root.querySelector<HTMLElement>('.ol-zoomslider-thumb')
  if (zoomSliderThumb) zoomSliderThumb.style.display = 'none'

  const rotateCtrl = root.querySelector<HTMLElement>('.ol-control.ol-rotate')
  if (rotateCtrl) rotateCtrl.style.top = '0'
}

const fitToPositionsCluster = (emMap: EmMap, layersByWearer: Map<string, WearerLayers>, crimeCentre: Coordinate) => {
  const view = emMap.olMapInstance!.getView()
  const combined = createEmpty()

  extendExtent(combined, [crimeCentre[0], crimeCentre[1], crimeCentre[0], crimeCentre[1]])

  for (const { locations } of layersByWearer.values()) {
    const extent = locations?.getSource?.()?.getExtent?.()
    if (extent && !isEmptyExtent(extent)) {
      extendExtent(combined, extent)
    }
  }

  if (isEmptyExtent(combined)) return

  view.fit(combined, {
    padding: [40, 40, 40, 40],
    maxZoom: 20,
  })

  const res = view.getResolution()
  if (typeof res === 'number') {
    view.setResolution(res * 1.3)
  }
}

const initialiseProximityAlertView = async () => {
  const emMap = queryElement(document, 'em-map') as EmMap

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  if (isHeadlessCapture()) {
    applyHideZoomSliderAndMoveCompass(emMap)

    const headlessSize = getHeadlessMapSizeFromUrl()
    if (headlessSize) {
      const el = emMap as unknown as HTMLElement
      el.style.width = `${headlessSize.widthPx}px`
      el.style.height = `${headlessSize.heightPx}px`
      emMap.olMapInstance?.updateSize()
    }
  }

  const allPositions = emMap.positions as ProximityAlertMapPosition[]

  const crime = allPositions.find(p => p.positionType === 'crime') as CrimePosition | undefined
  if (!crime) throw new Error('No crime position found in positions[] (expected one with positionType="crime")')

  const wearerPositions = allPositions.filter(p => p.positionType === 'wearer') as WearerPosition[]

  const centre = addCrimeLayers(emMap, crime)
  setCrimeDefaultView(emMap, centre)

  const positionsByWearer = new Map<string, WearerPosition[]>()
  for (const pos of wearerPositions) {
    const key = pos.deviceWearerId
    const list = positionsByWearer.get(key) ?? []
    list.push(pos)
    positionsByWearer.set(key, list)
  }

  const layersByWearer = new Map<string, WearerLayers>()

  let colourIndex = 0
  for (const [wearerId, positions] of positionsByWearer.entries()) {
    const colour = palette[colourIndex % palette.length]
    colourIndex += 1

    const locations = emMap.addLayer(
      new LocationsLayer({
        id: `locations-${wearerId}`,
        title: `locations-${wearerId}`,
        positions,
        zIndex: 4,
        style: {
          fill: colour,
          stroke: { color: colour, width: 0 },
        },
      }),
    ) as unknown as LayerWithSource

    const tracks = emMap.addLayer(
      new TracksLayer({
        id: `tracks-${wearerId}`,
        title: `tracks-${wearerId}`,
        positions,
        zIndex: 2,
        visible: true,
      }),
    ) as unknown as LayerWithSource

    const circles = emMap.addLayer(
      new CirclesLayer({
        id: `confidence-${wearerId}`,
        title: `confidence-${wearerId}`,
        positions,
        zIndex: 3,
        visible: true,
      }),
    ) as unknown as LayerWithSource

    const labels = emMap.addLayer(
      new TextLayer({
        id: `labels-${wearerId}`,
        title: `labels-${wearerId}`,
        positions,
        textProperty: 'sequenceLabel',
        zIndex: 5,
        visible: true,
      }),
    ) as unknown as LayerWithSource

    layersByWearer.set(wearerId, { locations, tracks, circles, labels })
  }

  const setTracksVisible = (visible: boolean) => {
    for (const layers of layersByWearer.values()) {
      layers.tracks?.setVisible?.(visible)
    }
  }

  const setTracksVisibleForWearer = (wearerId: string, visible: boolean) => {
    const layers = layersByWearer.get(wearerId)
    layers?.tracks?.setVisible?.(visible)
  }

  const setTracksVisibleByAllowList = (wearerIds: string[], visibleForAllowed: boolean) => {
    const allowed = new Set(wearerIds.map(String))
    for (const [id, layers] of layersByWearer.entries()) {
      const on = allowed.has(String(id))
      layers.tracks?.setVisible?.(on ? visibleForAllowed : false)
    }
  }

  const setAllWearerLayersVisible = (visible: boolean) => {
    for (const layers of layersByWearer.values()) {
      layers.locations?.setVisible?.(visible)
      layers.tracks?.setVisible?.(visible)
      layers.circles?.setVisible?.(visible)
      layers.labels?.setVisible?.(visible)
    }
  }

  const setWearerOnlyVisible = (wearerId: string) => {
    for (const [id, layers] of layersByWearer.entries()) {
      const on = id === wearerId
      layers.locations?.setVisible?.(on)
      layers.tracks?.setVisible?.(on)
      layers.circles?.setVisible?.(on)
      layers.labels?.setVisible?.(on)
    }
  }

  const setWearersVisibleByAllowList = (wearerIds: string[]) => {
    const allowed = new Set(wearerIds.map(String))
    for (const [id, layers] of layersByWearer.entries()) {
      const on = allowed.has(String(id))
      layers.locations?.setVisible?.(on)
      layers.tracks?.setVisible?.(on)
      layers.circles?.setVisible?.(on)
      layers.labels?.setVisible?.(on)
    }
  }

  const defaultView = () => {
    setAllWearerLayersVisible(true)
    setCrimeDefaultView(emMap, centre)
  }

  const getSelectedWearerIds = (): string[] | null => getWearerIdsFromUrl()

  const applySelectedWearersIfPresentOrAll = () => {
    const selected = getSelectedWearerIds()
    if (selected) setWearersVisibleByAllowList(selected)
    else setAllWearerLayersVisible(true)
  }

  // Overview Image 1 semantics (no fit here; view is set by applyImage1CaptureState)
  const proximityAlertImage1 = () => {
    const selected = getSelectedWearerIds()
    if (selected) {
      setWearersVisibleByAllowList(selected)
      setTracksVisibleByAllowList(selected, true)
    } else {
      setAllWearerLayersVisible(true)
      setTracksVisible(true)
    }
  }

  // Overview Image 2 semantics (this is the only “fit” in the flow)
  const proximityAlertImage2 = () => {
    applySelectedWearersIfPresentOrAll()
    setTracksVisible(false)
    fitToPositionsCluster(emMap, layersByWearer, centre)
  }

  // Wearer image 1: toggle only; tracks ON for that wearer
  const wearerImage1 = (wearerId: string) => {
    setWearerOnlyVisible(wearerId)
    setTracksVisible(false)
    setTracksVisibleForWearer(wearerId, true)
  }

  // Wearer image 2: toggle only; tracks OFF
  const wearerImage2 = (wearerId: string) => {
    setWearerOnlyVisible(wearerId)
    setTracksVisible(false)
  }

  const getImage1CaptureState = (): Image1CaptureState => {
    const map = emMap.olMapInstance!
    const view = map.getView()

    const el = emMap as unknown as HTMLElement
    const rect = el.getBoundingClientRect()

    const center = view.getCenter()
    const resolution = view.getResolution()
    const rotation = view.getRotation()

    if (!center || typeof resolution !== 'number' || typeof rotation !== 'number') {
      throw new Error('Could not read map view state for export')
    }

    return {
      mapWidthPx: Math.round(rect.width),
      mapHeightPx: Math.round(rect.height),
      devicePixelRatio: window.devicePixelRatio || 1,
      view: {
        center: [center[0], center[1]],
        resolution,
        rotation,
      },
    }
  }

  const applyImage1CaptureState = (state: Image1CaptureState) => {
    // ensure layers match overview image-1 semantics first
    proximityAlertImage1()

    const map = emMap.olMapInstance!
    const view = map.getView()

    view.setRotation(state.view.rotation)
    view.setResolution(state.view.resolution)
    view.setCenter(state.view.center)

    map.renderSync()
  }

  ;(
    window as unknown as {
      mapImages?: {
        applyPreset: (preset: PresetParam, wearerId?: string) => void
        getImage1CaptureState: () => Image1CaptureState
        applyImage1CaptureState: (state: Image1CaptureState) => void
      }
    }
  ).mapImages = {
    applyPreset: (preset: PresetParam, wearerId?: string) => {
      if (preset === 'default') defaultView()
      if (preset === 'image-2') proximityAlertImage2()
      if (preset === 'wearer-image-1') {
        if (!wearerId) throw new Error('wearer-image-1 preset requires wearerId')
        wearerImage1(wearerId)
      }
      if (preset === 'wearer-image-2') {
        if (!wearerId) throw new Error('wearer-image-2 preset requires wearerId')
        wearerImage2(wearerId)
      }
    },
    getImage1CaptureState,
    applyImage1CaptureState,
  }

  const preset = getPresetFromUrl()
  const wearerId = getWearerIdFromUrl()
  if (preset) {
    ;(
      window as unknown as { mapImages?: { applyPreset: (p: PresetParam, w?: string) => void } }
    ).mapImages?.applyPreset(preset, wearerId ?? undefined)
  }

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )

  // Capture Image 1 state at submit time
  const exportForm = document.querySelector<HTMLFormElement>('#exportProximityAlertForm')
  const image1StateInput = document.querySelector<HTMLInputElement>('#image1State')

  if (exportForm && image1StateInput) {
    exportForm.addEventListener('submit', () => {
      try {
        const state = getImage1CaptureState()
        image1StateInput.value = JSON.stringify(state)
      } catch {
        image1StateInput.value = ''
      }
    })
  }
}

export default initialiseProximityAlertView
