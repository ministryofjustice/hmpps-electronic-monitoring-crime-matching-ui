import { EmMap, Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { fromLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'
import { queryElement, queryElementAll } from '../../utils/utils'
import CrimeLayer from './layers/crime'
import DeviceWearerLayer from './layers/deviceWearer'
import initialiseProximityAlertForm from '../../forms/proximity-alert'

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

const applyCheckboxLayerState = () => {
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
const getCapturedMapState = (): CapturedMapState | undefined => {
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

const isHeadlessCapture = (): boolean => {
  const params = new URLSearchParams(window.location.search)
  return params.get('headless') === 'true'
}

const getHeadlessMapSizeFromUrl = (): { widthPx: number; heightPx: number } | null => {
  const params = new URLSearchParams(window.location.search)
  const mapWidthPx = params.get('mapWidthPx')
  const mapHeightPx = params.get('mapHeightPx')

  if (!mapWidthPx || !mapHeightPx) return null

  const widthPx = Number(mapWidthPx)
  const heightPx = Number(mapHeightPx)

  if (!Number.isFinite(widthPx) || !Number.isFinite(heightPx) || widthPx <= 0 || heightPx <= 0) {
    return null
  }

  return { widthPx, heightPx }
}

// Headless-only UI tweaks for export screenshots:
const applyHeadlessUiTweaks = (emMap: EmMap) => {
  const root = emMap.shadowRoot
  if (!root) return

  const controls = root.querySelectorAll<HTMLElement>('.ol-control, .ol-attribution')
  controls.forEach(controlEl => {
    const el = controlEl
    el.style.display = 'none'
  })
}

const applyHeadlessMapMode = (emMap: EmMap) => {
  const map = emMap.olMapInstance
  if (!map) return

  applyHeadlessUiTweaks(emMap)

  const headlessSize = getHeadlessMapSizeFromUrl()
  if (headlessSize) {
    const mapElement = emMap as unknown as HTMLElement
    mapElement.style.width = `${headlessSize.widthPx}px`
    mapElement.style.height = `${headlessSize.heightPx}px`
    map.updateSize()
  }

  map.renderSync()
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

type MapData = {
  crimePosition: Position
  matching?: {
    deviceWearers: Array<{
      deviceId: number
      positions: Array<Position>
    }>
  }
}

const initialiseProximityAlertView = async () => {
  const data = readJsonFromScript<MapData>('map-data')

  if (!data) {
    return
  }

  const emMap = queryElement(document, 'em-map') as EmMap
  const isHeadless = isHeadlessCapture()

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const { centre } = addCrimeLayers(emMap, data.crimePosition)

  setCrimeDefaultView(emMap, centre)

  if (data.matching) {
    let colourIndex = 0
    for (const deviceWearer of data.matching.deviceWearers) {
      emMap.addLayerGroup(
        new DeviceWearerLayer(
          deviceWearer.deviceId,
          data.crimePosition,
          deviceWearer.positions,
          palette[colourIndex % palette.length],
        ),
      )
      colourIndex += 1
    }
  }

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )

  applyCheckboxLayerState()

  const capturedMapState = getCapturedMapState()
  if (capturedMapState) {
    applyCapturedMapState(emMap, capturedMapState)
  }

  if (isHeadless) {
    applyHeadlessMapMode(emMap)
    return
  }

  initialiseProximityAlertForm()
}

export default initialiseProximityAlertView
