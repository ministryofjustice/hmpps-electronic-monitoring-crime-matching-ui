import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { fromLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'
import { queryElement, queryElementAll } from '../../utils/utils'
import CrimeLayer from './layers/crime'
import DeviceWearerLayer from './layers/deviceWearer'
import { CrimePosition, WearerPosition } from './types'
import initialiseProximityAlertForm from '../../forms/proximity-alert'

type ProximityAlertMapPosition = WearerPosition | CrimePosition

type CapturedMapState = {
  mapWidthPx: number
  mapHeightPx: number
  devicePixelRatio: number
  view: {
    center: [number, number]
    resolution: number
    rotation: number
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
const addCrimeLayers = (emMap: EmMap, crime: CrimePosition): { centre: Coordinate } => {
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

const restoreCheckboxLayerState = () => {
  const selectors = [
    'input[type="checkbox"][name="device-wearer-toggle"]',
    'input[type="checkbox"][name="device-wearer-tracks"]',
    'input[type="checkbox"][name="analysis-toggles"]',
  ]

  for (const selector of selectors) {
    const checkboxes = queryElementAll(document, selector, HTMLInputElement)

    checkboxes.forEach(checkbox => {
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }
}

// Type guard to validate the structure of the captured map state
const isValidCapturedMapState = (parsedMapState: unknown): parsedMapState is CapturedMapState => {
  if (!parsedMapState || typeof parsedMapState !== 'object') return false

  const parsedState = parsedMapState as {
    mapWidthPx?: unknown
    mapHeightPx?: unknown
    devicePixelRatio?: unknown
    view?: {
      center?: unknown
      resolution?: unknown
      rotation?: unknown
    }
  }

  return (
    typeof parsedState.mapWidthPx === 'number' &&
    typeof parsedState.mapHeightPx === 'number' &&
    typeof parsedState.devicePixelRatio === 'number' &&
    !!parsedState.view &&
    Array.isArray(parsedState.view.center) &&
    parsedState.view.center.length === 2 &&
    typeof parsedState.view.center[0] === 'number' &&
    typeof parsedState.view.center[1] === 'number' &&
    typeof parsedState.view.resolution === 'number' &&
    typeof parsedState.view.rotation === 'number'
  )
}

// Attempt to read captured map state from hidden input field
const getRestoredCapturedMapState = (): CapturedMapState | undefined => {
  const mapStateInput = document.querySelector<HTMLInputElement>('#capturedMapState')
  if (!mapStateInput) return undefined

  const mapStateValue = mapStateInput.value.trim()
  if (!mapStateValue) return undefined

  try {
    const parsedMapState: unknown = JSON.parse(mapStateValue)
    return isValidCapturedMapState(parsedMapState) ? parsedMapState : undefined
  } catch {
    return undefined
  }
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

  let colourIndex = 0
  for (const [deviceId, positions] of positionsByWearer.entries()) {
    const colour = palette[colourIndex % palette.length]
    colourIndex += 1

    emMap.addLayerGroup(new DeviceWearerLayer(deviceId, crime, positions, colour))
  }

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )

  restoreCheckboxLayerState()

  const capturedMapState = getRestoredCapturedMapState()
  if (capturedMapState) {
    applyCapturedMapState(emMap, capturedMapState)
  }

  initialiseProximityAlertForm()
}

export default initialiseProximityAlertView
