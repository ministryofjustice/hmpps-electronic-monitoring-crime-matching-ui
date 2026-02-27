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
import { Point } from 'ol/geom'
import { Fill, Stroke, Style, RegularShape } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'
import { createEmpty, extend as extendExtent, isEmpty as isEmptyExtent } from 'ol/extent'
import { circular as circularPolygon } from 'ol/geom/Polygon'
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

// Read '?preset=...' from the URL and validate it against the supported preset values.
function getPresetFromUrl(): PresetParam | null {
  const params = new URLSearchParams(window.location.search)
  const preset = params.get('preset')
  if (preset === 'default' || preset === 'image-2' || preset === 'wearer-image-1' || preset === 'wearer-image-2')
    return preset
  return null
}

// Read `?wearerId=...` from the URL.
function getWearerIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const wearerId = params.get('wearerId')
  return wearerId || null
}

// Read `?wearerIds=a,b,c` from the URL.
// This is used by export to select a subset of wearers to include in screenshots.
function getWearerIdsFromUrl(): string[] | null {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('wearerIds')
  if (!raw) return null
  const ids = raw
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
  return ids.length ? ids : null
}

// Detect whether the page has been loaded in "headless capture" mode.
// In this mode we apply a few DOM tweaks such as hiding the zoom controls.
function isHeadlessCapture(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.get('headless') === 'true'
}

// Read `?mapW=...&mapH=...` from the URL.
// When present, we force the `<em-map>` DOM size so Playwright can screenshot a predictable viewport.
function getHeadlessMapSizeFromUrl(): { widthPx: number; heightPx: number } | null {
  const params = new URLSearchParams(window.location.search)
  const mapWidth = params.get('mapW')
  const mapHeight = params.get('mapH')
  if (!mapWidth || !mapHeight) return null

  const widthPx = Number(mapWidth)
  const heightPx = Number(mapHeight)

  if (!Number.isFinite(widthPx) || !Number.isFinite(heightPx) || widthPx <= 0 || heightPx <= 0) return null
  return { widthPx, heightPx }
}

// Add the crime marker + crime radius layers to the map.
// Returns the crime location as an OL coordinate (EPSG:3857).
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

  // Crime radius. This is drawn as a geodesic circle polygon in lon/lat, then transformed to the map projection.
  // Otherwise, the radius becomes inaccurate except at the equator.
  const radiusGeom = circularPolygon([crime.longitude, crime.latitude], crime.radiusMeters, 96).transform(
    'EPSG:4326',
    map.getView().getProjection(),
  )

  const crimeRadiusFeature = new Feature({ geometry: radiusGeom })
  crimeRadiusFeature.setStyle(
    new Style({
      fill: new Fill({ color: 'rgba(0, 0, 0, 0.12)' }),
      stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.45)', width: 2 }),
    }),
  )

  const crimeRadiusLayer = new VectorLayer({
    source: new VectorSource({ features: [crimeRadiusFeature] }),
  })
  crimeRadiusLayer.setZIndex(1)
  map.addLayer(crimeRadiusLayer)

  return centre
}

// Set the initial view for user interactive use
const setCrimeDefaultView = (emMap: EmMap, centre: Coordinate) => {
  const map = emMap.olMapInstance!
  map.getView().setCenter(centre)
  map.getView().setZoom(16.5)
}

// Headless-only UI tweaks for export screenshots:
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

// Fit the map view to show the crime + all wearer positions in the cluster then zoom out 1.3
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

  // Small zoom-out buffer so the resulting screenshot isn't "too tight".
  const res = view.getResolution()
  if (typeof res === 'number') {
    view.setResolution(res * 1.3)
  }
}

// Initialize the map and layers, and expose an API for applying presets and capturing view state for Playwright.
const initialiseProximityAlertView = async () => {
  const emMap = queryElement(document, 'em-map') as EmMap
  const isHeadless = isHeadlessCapture()

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  if (isHeadless) {
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

  if (!isHeadless) {
    setCrimeDefaultView(emMap, centre)
  }

  // Group wearer positions by deviceWearerId so we can create a layer bundle per wearer.
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

  // Toggle tracks on/off for all wearers.
  const setTracksVisible = (visible: boolean) => {
    for (const layers of layersByWearer.values()) {
      layers.tracks?.setVisible?.(visible)
    }
  }

  // Toggle tracks on/off for a single wearer.
  const setTracksVisibleForWearer = (wearerId: string, visible: boolean) => {
    const layers = layersByWearer.get(wearerId)
    layers?.tracks?.setVisible?.(visible)
  }

  // Toggle tracks on for selected wearers; force tracks off for everyone else.
  const setTracksVisibleBySelectedWearerIds = (selectedWearerIds: string[], visibleForSelected: boolean) => {
    const selectedWearerIdSet = new Set(selectedWearerIds)
    for (const [id, layers] of layersByWearer.entries()) {
      const isSelected = selectedWearerIdSet.has(id)
      layers.tracks?.setVisible?.(isSelected ? visibleForSelected : false)
    }
  }

  // Toggle all wearer layers (locations/tracks/circles/labels) on/off.
  const setAllWearerLayersVisible = (visible: boolean) => {
    for (const layers of layersByWearer.values()) {
      layers.locations?.setVisible?.(visible)
      layers.tracks?.setVisible?.(visible)
      layers.circles?.setVisible?.(visible)
      layers.labels?.setVisible?.(visible)
    }
  }

  // Show only one wearer (all its layers); hide every other wearer.
  const setWearerOnlyVisible = (wearerId: string) => {
    for (const [id, layers] of layersByWearer.entries()) {
      const on = id === wearerId
      layers.locations?.setVisible?.(on)
      layers.tracks?.setVisible?.(on)
      layers.circles?.setVisible?.(on)
      layers.labels?.setVisible?.(on)
    }
  }

  // Show only the selected wearers (all their layers); hide everyone else.
  const setWearersVisibleBySelectedWearerIds = (selectedWearerIds: string[]) => {
    const selectedWearerIdSet = new Set(selectedWearerIds)
    for (const [id, layers] of layersByWearer.entries()) {
      const isSelected = selectedWearerIdSet.has(id)
      layers.locations?.setVisible?.(isSelected)
      layers.tracks?.setVisible?.(isSelected)
      layers.circles?.setVisible?.(isSelected)
      layers.labels?.setVisible?.(isSelected)
    }
  }

  // Return a subset map of wearer layers restricted to the selected wearer IDs.
  // Used when fitting overview image 2 to only selected wearers.
  const layersBySelectedWearerIds = (selectedWearerIds: string[]): Map<string, WearerLayers> => {
    const filteredLayersByWearer = new Map<string, WearerLayers>()
    for (const wearerId of selectedWearerIds) {
      const layers = layersByWearer.get(wearerId)
      if (layers) filteredLayersByWearer.set(wearerId, layers)
    }
    return filteredLayersByWearer
  }

  // Reset to a sane interactive default: show everything + centre on crime with a fixed zoom.
  const defaultView = () => {
    setAllWearerLayersVisible(true)
    if (!isHeadless) setCrimeDefaultView(emMap, centre)
  }

  // Read the selected wearer IDs from the URL (if present).
  const getSelectedWearerIds = (): string[] | null => getWearerIdsFromUrl()

  // Apply URL selection if present; otherwise show all wearers.
  // Used as a helper for overview presets.
  const applySelectedWearersIfPresentOrAll = () => {
    const selectedWearerIds = getSelectedWearerIds()
    if (selectedWearerIds) setWearersVisibleBySelectedWearerIds(selectedWearerIds)
    else setAllWearerLayersVisible(true)
  }

  // Overview Image 1 criteria:
  // - show all wearers by default (or selected subset if specified in URL)
  // - tracks ON for all wearers
  const proximityAlertImage1 = () => {
    const selectedWearerIds = getSelectedWearerIds()
    if (selectedWearerIds) {
      setWearersVisibleBySelectedWearerIds(selectedWearerIds)
      setTracksVisibleBySelectedWearerIds(selectedWearerIds, true)
    } else {
      setAllWearerLayersVisible(true)
      setTracksVisible(true)
    }
  }

  // Overview Image 2 criteria:
  // - show all wearers by default (or selected subset if specified in URL)
  // - tracks OFF for all wearers
  const proximityAlertImage2 = () => {
    const selectedWearerIds = getSelectedWearerIds()
    applySelectedWearersIfPresentOrAll()
    setTracksVisible(false)

    if (selectedWearerIds) {
      fitToPositionsCluster(emMap, layersBySelectedWearerIds(selectedWearerIds), centre)
    } else {
      fitToPositionsCluster(emMap, layersByWearer, centre)
    }
  }

  // Wearer image 1 criteria:
  // - show only that wearer
  // - tracks ON for that wearer
  const wearerImage1 = (wearerId: string) => {
    setWearerOnlyVisible(wearerId)
    setTracksVisible(false)
    setTracksVisibleForWearer(wearerId, true)
  }

  // Wearer image 2 criteria:
  // - show only that wearer
  // - tracks OFF for that wearer
  const wearerImage2 = (wearerId: string) => {
    setWearerOnlyVisible(wearerId)
    setTracksVisible(false)
  }

  // Capture the current view state needed to replicate the Image 1 preset.
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

  // Apply a previously captured Image 1 view state to restore the map to the exact same position/zoom/rotation
  // as when the user submitted the export form.
  const applyImage1CaptureState = (state: Image1CaptureState) => {
    proximityAlertImage1()

    const map = emMap.olMapInstance!
    const view = map.getView()

    view.setRotation(state.view.rotation)
    view.setResolution(state.view.resolution)
    view.setCenter(state.view.center)

    map.renderSync()
  }

  // Expose an API for applying presets and getting/setting Image 1 capture state, which Playwright can
  // call via page.evaluate().
  const mapImagesApi: {
    applyPreset: (preset: PresetParam, wearerId?: string) => void
    getImage1CaptureState: () => Image1CaptureState
    applyImage1CaptureState: (state: Image1CaptureState) => void
  } = {
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

  // Attach API to window for Playwright (and for URL-driven presets).
  const win = window as unknown as { mapImages?: typeof mapImagesApi }
  win.mapImages = mapImagesApi

  // If a valid preset is specified in the URL, apply it on page load.
  const preset = getPresetFromUrl()
  const wearerId = getWearerIdFromUrl()
  if (preset) {
    mapImagesApi.applyPreset(preset, wearerId ?? undefined)
  }

  // Signal to Playwright/tests that custom layers have been created and added.
  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )

  // Capture Image 1 view state at submit time so the server can replay the exact view in headless export.
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
