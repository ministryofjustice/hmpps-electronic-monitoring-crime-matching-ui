import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import {
  LocationsLayer,
  CirclesLayer,
  TextLayer,
  TracksLayer,
  NativeLayerWrapper,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import { createEmpty } from 'ol/extent'
import { fromLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'
import { queryElement } from '../../utils/utils'
import createLayerVisibilityToggle from '../location-data/controls/layerVisibilityToggle'
import LayerGroup from 'ol/layer/Group'

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
  crimeTypeId: string
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
  tracks?: LayerWithSource
}

type CircleInput = {
  latitude: number
  longitude: number
  precision: number
}

const palette = [
  '#d00050', 
  '#fffb06',
  '#1065f9',
  '#69c9ff',
  '#d87300',
  '#a900bc',
  '#965a00',
  '#904aff',
  '#a492ff',
  '#ffc7ea',
  '#f3c715',
  '#00a775',
  '#1e2db0',
  '#acacac',
  '#0693e2',
  '#8fbb00',
]

// Add a Crime marker
const addCrimeLayers = (emMap: EmMap, crime: CrimePosition): { centre: Coordinate, layerGroup: LayerGroup } => {
  const centre = fromLonLat([crime.longitude, crime.latitude])
  
  const crimeMarkerLayer = new LocationsLayer({
    positions: [crime],
    marker: {
      type: 'pin',
      pin: { color: '#d4351c' },
    },
  })

  // Add a Crime 100m radius circle
  const circlePos: CircleInput = {
    latitude: crime.latitude,
    longitude: crime.longitude,
    precision: 100,
  }

  const crimeRadius = new CirclesLayer({
    id: 'crime-radius',
    title: 'crime-radius',
    zIndex: 1,
    visible: true,
    style: {
      fill: 'rgba(0, 0, 0, 0.12)',
      stroke: { color: 'rgba(0, 0, 0, 0.45)', width: 2 },
    },
    positions: [circlePos],
  })

  const crimeTypeLabel = new TextLayer({
    id: `labels-crime-type`,
    title: `labels-crime-type`,
    positions: [crime],
    textProperty: 'crimeTypeId',
    zIndex: 5,
    visible: true,
    style: {
      fill: '#d4351c',
      offset: { x: 0, y: 20 },
      textAlign: 'center',
    },
  })

  emMap.addLayer(crimeMarkerLayer)
  emMap.addLayer(crimeRadius)
  emMap.addLayer(crimeTypeLabel)

  const layerGroup = new LayerGroup({
    layers: [
      crimeMarkerLayer.getPrimaryLayer(),
      crimeRadius.getPrimaryLayer(),
      crimeTypeLabel.getPrimaryLayer()
    ]
  })

  emMap.addLayer(new NativeLayerWrapper(layerGroup))

  return { centre, layerGroup }
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

  const { centre, layerGroup } = addCrimeLayers(emMap, crime)

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
        id: `locations-${deviceId}`,
        title: `locations-${deviceId}`,
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
        id: `tracks-${deviceId}`,
        title: `tracks-${deviceId}`,
        positions,
        entryExit: {
          enabled: true,
          extensionDistanceMeters: 100,
          centre: [crime.latitude, crime.longitude],
          radiusMeters: 100,
        },
        zIndex: 2,
        visible: false,
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

    layersByWearer.set(deviceId, { locations, tracks, labels })
  }

  if (layerGroup) createLayerVisibilityToggle('#crime-include', layerGroup, emMap)

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )
}

export default initialiseProximityAlertView
