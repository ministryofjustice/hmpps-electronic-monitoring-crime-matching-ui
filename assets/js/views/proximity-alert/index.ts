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

declare global {
  interface Window {
    mapImages?: {
      defaultView: () => void
      proximityAlertImage1: () => void
      proximityAlertImage2: () => void
      ready: boolean
    }
  }
}

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

type CrimeLayers = {
  radiusFeatureForExtent: Feature<CircleGeom>
}

type CircleInput = {
  latitude: number
  longitude: number
  precision: number
}

const palette = ['rgba(255, 214, 10, 1)', 'rgba(139, 69, 19, 1)']

// Add a Crime marker (for spike just drawing a square). Will need to be a marker with label.
const addCrimeLayers = (emMap: EmMap, crime: CrimePosition): { centre: Coordinate; crimeLayers: CrimeLayers } => {
  const map = emMap.olMapInstance!
  const centre = fromLonLat([crime.longitude, crime.latitude])

  // Crime square marker
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

  // Add a Crime 100m radius circle
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

  // Create a feature with the crime radius geometry for later calculating extent when fitting to the crime circle
  const radiusFeatureForExtent = new Feature({
    geometry: new CircleGeom(centre, crime.radiusMeters),
  })

  return { centre, crimeLayers: { radiusFeatureForExtent } }
}

// Default map view
const setCrimeDefaultView = (emMap: EmMap, centre: Coordinate) => {
  const map = emMap.olMapInstance!
  map.getView().setCenter(centre)
  map.getView().setZoom(16.5)
}

// Hide zoom slider as we don't want it in generated images + move compass icon to the top.
const applyHideZoomSliderAndMoveCompass = (emMap: EmMap) => {
  const root = emMap.shadowRoot
  if (!root) return

  // Hide the zoom slider (if present)
  const zoomSlider = root.querySelector<HTMLElement>('.ol-zoom')
  if (zoomSlider) {
    zoomSlider.style.display = 'none'
  }

  const zoomSliderThumb = root.querySelector<HTMLElement>('.ol-zoomslider-thumb')
  if (zoomSliderThumb) {
    zoomSliderThumb.style.display = 'none'
  }

  // Move rotate/compass to the top
  const rotateCtrl = root.querySelector<HTMLElement>('.ol-control.ol-rotate')
  if (rotateCtrl) {
    rotateCtrl.style.top = '0'
  }
}

// Proximity Alert Image 1: zoom to 100m crime circle extent with small margin
const fitToCrimeCircle = (emMap: EmMap, radiusFeature: Feature<CircleGeom>) => {
  const map = emMap.olMapInstance!
  const extent = radiusFeature.getGeometry()?.getExtent()
  if (!extent || isEmptyExtent(extent)) return

  map.getView().fit(extent, {
    padding: [80, 80, 80, 80],
    maxZoom: 20,
    size: map.getSize(),
  })
}

// Proximity Alert Image 2: zoom to cluster of wearer positions + crime with small margin (dynamic radius)
const fitToPositionsCluster = (emMap: EmMap, layersByWearer: Map<string, WearerLayers>, crimeCentre: Coordinate) => {
  const map = emMap.olMapInstance!
  const view = map.getView()

  const combined = createEmpty()

  // Always include crime centre
  extendExtent(combined, [crimeCentre[0], crimeCentre[1], crimeCentre[0], crimeCentre[1]])

  // Fit to wearer positions extent
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

  // Zoom out to more closely match Figma images.
  const res = view.getResolution()
  if (typeof res === 'number') {
    view.setResolution(res * 1.3)
  }
}

const initialiseProximityAlertMapImagesView = async () => {
  const emMap = queryElement(document, 'em-map') as EmMap

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  if (window.headlessMapCapture === true) {
    applyHideZoomSliderAndMoveCompass(emMap)
  }

  const map = emMap.olMapInstance!
  const allPositions = emMap.positions as ProximityAlertMapPosition[]

  const crime = allPositions.find(p => p.positionType === 'crime') as CrimePosition | undefined
  if (!crime) throw new Error('No crime position found in positions[] (expected one with positionType="crime")')

  const wearerPositions = allPositions.filter(p => p.positionType === 'wearer') as WearerPosition[]

  const { centre, crimeLayers } = addCrimeLayers(emMap, crime)
  setCrimeDefaultView(emMap, centre)

  // Group wearer positions by device wearer
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

  // UI Map state change buttons
  const defaultView = () => {
    setTracksVisible(true)
    setCrimeDefaultView(emMap, centre)
  }

  const proximityAlertImage1 = () => {
    setTracksVisible(true)
    fitToCrimeCircle(emMap, crimeLayers.radiusFeatureForExtent)
  }

  const proximityAlertImage2 = () => {
    setTracksVisible(false)
    fitToPositionsCluster(emMap, layersByWearer, centre)
  }

  // Signal ready for Playwright
  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )

  // Expose control for Playwright + manual UI buttons
  window.mapImages = {
    defaultView,
    proximityAlertImage1,
    proximityAlertImage2,
    ready: true,
  }

  // Wire up sidebar buttons for demo/spike UI
  document.getElementById('preset-default')?.addEventListener('click', defaultView)
  document.getElementById('preset-image-1')?.addEventListener('click', proximityAlertImage1)
  document.getElementById('preset-image-2')?.addEventListener('click', proximityAlertImage2)

  // Wire up fixture radio buttons for demo/spike UI
  const fixtureToId: Record<string, string> = {
    clustered: '1',
    opposite: '2',
    sparse: '3',
  }

  const fixtureRadios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="fixture"]'))

  for (const radio of fixtureRadios) {
    radio.addEventListener('change', () => {
      if (!radio.checked) return

      const id = fixtureToId[radio.value] ?? '1'
      window.location.href = `/proximity-alert/${id}`
    })
  }
}

export default initialiseProximityAlertMapImagesView
