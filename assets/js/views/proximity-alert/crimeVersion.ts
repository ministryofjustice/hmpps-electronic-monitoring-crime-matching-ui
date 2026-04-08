import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import {
  LocationsLayer,
  CirclesLayer,
  TextLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import Feature from 'ol/Feature'
import { createEmpty } from 'ol/extent'
import { fromLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { Point, Circle as CircleGeom } from 'ol/geom'
import { Fill, Stroke, Style, RegularShape } from 'ol/style'
import type { Coordinate } from 'ol/coordinate'
import { queryElement } from '../../utils/utils'

type WearerPosition = {
  positionType: 'wearer'
  latitude: number
  longitude: number
  precision: number
  timestamp: string
  sequenceLabel: string
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

// Add a Crime marker, will need to be a marker with label.
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
    precision: 100,
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

const initialiseProximityAlertView = async () => {
  const emMap = queryElement(document, 'em-map') as EmMap

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const allPositions = emMap.positions as ProximityAlertMapPosition[]

  const crime = allPositions.find(p => p.positionType === 'crime') as CrimePosition | undefined
  if (!crime) throw new Error('No crime position found in positions[] (expected one with positionType="crime")')

  const wearerPositions = allPositions.filter(p => p.positionType === 'wearer') as WearerPosition[]

  const { centre } = addCrimeLayers(emMap, crime)

  setCrimeDefaultView(emMap, centre)

  // Group wearer positions by device wearer
  const positionsByWearer = new Map<number, WearerPosition[]>()
  for (const pos of wearerPositions) {
    const key = pos.deviceId
    const list = positionsByWearer.get(key) ?? []
    list.push(pos)
    positionsByWearer.set(key, list)
  }

  const layersByWearer = new Map<number, WearerLayers>()

  let colourIndex = 0
  for (const [deviceId, positions] of positionsByWearer.entries()) {
    const colour = palette[colourIndex % palette.length]
    colourIndex += 1

    const locations = emMap.addLayer(
      new LocationsLayer({
        id: `device-wearer-positions-${deviceId}`,
        title: `locations-${deviceId}`,
        positions,
        zIndex: 4,
        style: {
          fill: colour,
          stroke: { color: colour, width: 0 },
        },
      }),
    ) as unknown as LayerWithSource

    const labels = emMap.addLayer(
      new TextLayer({
        id: `labels-${deviceId}`,
        title: `labels-${deviceId}`,
        positions,
        textProperty: 'sequenceLabel',
        zIndex: 5,
        visible: true,
      }),
    ) as unknown as LayerWithSource

    layersByWearer.set(deviceId, { locations, labels })
  }

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )
}

export default initialiseProximityAlertView
