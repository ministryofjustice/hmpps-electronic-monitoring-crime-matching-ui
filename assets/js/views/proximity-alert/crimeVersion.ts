import { EmMap, Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { fromLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'
import { queryElement } from '../../utils/utils'
import CrimeLayer from './layers/crime'
import DeviceWearerLayer from './layers/deviceWearer'
import initialiseProximityAlertExportView from './mapExport'
import initialiseProximityAlertUserView from './mapUserView'

export type CapturedMapState = {
  mapWidthPx: number
  mapHeightPx: number
  devicePixelRatio: number
  view: {
    center: [number, number]
    resolution: number
    rotation: number
  }
}

export type MapData = {
  crimePosition: Position
  matching?: {
    deviceWearers: Array<{
      deviceId: number
      positions: Array<Position>
    }>
  }
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

// Add Crime marker layers
const addCrimeLayers = (emMap: EmMap, crime: Position): { centre: Coordinate } => {
  const centre = fromLonLat([crime.longitude, crime.latitude])

  emMap.addLayerGroup(new CrimeLayer(crime))

  return { centre }
}

// Default map view
const setCrimeDefaultView = (emMap: EmMap, centre: Coordinate) => {
  const map = emMap.olMapInstance!
  map.getView().setCenter(centre)
  map.getView().setZoom(16.5)
}

// Apply captured map state to the map view
const applyCapturedMapState = (emMap: EmMap, mapState: CapturedMapState) => {
  const map = emMap.olMapInstance
  const mapView = map?.getView()

  if (!map || !mapView) return

  mapView.setRotation(mapState.view.rotation)
  mapView.setResolution(mapState.view.resolution)
  mapView.setCenter(mapState.view.center)

  map.renderSync()
}

// Determines if the page is running in headless export mode.
const isHeadlessCapture = (): boolean => {
  const params = new URLSearchParams(window.location.search)
  return params.get('headless') === 'true'
}

// Reads selected device IDs from the headless export URL and returns them as a numeric set.
const getHeadlessSelectedDeviceIds = (): Set<number> => {
  const params = new URLSearchParams(window.location.search)
  const selectedDeviceIds = params.get('selectedDeviceIds')

  if (!selectedDeviceIds) return new Set()

  const parsedDeviceIds = selectedDeviceIds
    .split(',')
    .map(deviceId => Number(deviceId))
    .filter(deviceId => Number.isFinite(deviceId))

  return new Set(parsedDeviceIds)
}

// Filters map data to include only selected device wearers when running in headless export mode.
const filterMapDataForHeadlessExport = (data: MapData): MapData => {
  const selectedDeviceIds = getHeadlessSelectedDeviceIds()

  return {
    ...data,
    matching: data.matching
      ? {
          ...data.matching,
          deviceWearers: data.matching.deviceWearers.filter(deviceWearer =>
            selectedDeviceIds.has(deviceWearer.deviceId),
          ),
        }
      : undefined,
  }
}

const readJsonFromScript = <T>(id: string): T | undefined => {
  const script = document.querySelector(`script[type="application/json"][id="${id}"]`)

  if (script?.textContent) {
    try {
      return JSON.parse(script.textContent) as T
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid JSON in script[type="application/json"][id="${id}"]`, e)
    }
  }

  return undefined
}

// Initialises the shared proximity alert map, then delegates user or headless export behaviour.
const initialiseProximityAlertView = async () => {
  const allMapData = readJsonFromScript<MapData>('map-data')

  if (!allMapData) {
    return
  }

  const emMap = queryElement(document, 'em-map') as EmMap
  const isHeadless = isHeadlessCapture()
  const data = isHeadless ? filterMapDataForHeadlessExport(allMapData) : allMapData

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const { centre } = addCrimeLayers(emMap, data.crimePosition)

  setCrimeDefaultView(emMap, centre)

  const allDeviceIds: number[] = []

  if (data.matching) {
    const colourByDeviceId = new Map<number, string>()

    allMapData.matching?.deviceWearers.forEach((deviceWearer, index) => {
      colourByDeviceId.set(deviceWearer.deviceId, palette[index % palette.length])
    })

    for (const deviceWearer of data.matching.deviceWearers) {
      emMap.addLayerGroup(
        new DeviceWearerLayer(
          deviceWearer.deviceId,
          data.crimePosition,
          deviceWearer.positions,
          colourByDeviceId.get(deviceWearer.deviceId) ?? palette[0],
        ),
      )
      allDeviceIds.push(deviceWearer.deviceId)
    }
  }

  if (isHeadless) {
    initialiseProximityAlertExportView({
      emMap,
      data,
      mapDeviceIds: allDeviceIds,
      setCrimeDefaultView: () => setCrimeDefaultView(emMap, centre),
      applyCapturedMapState: state => applyCapturedMapState(emMap, state),
    })
  }

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )

  if (isHeadless === false) {
    initialiseProximityAlertUserView({
      applyCapturedMapState: state => applyCapturedMapState(emMap, state),
    })
  }
}

export default initialiseProximityAlertView
