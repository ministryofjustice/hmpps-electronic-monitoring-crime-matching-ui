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

type PresetParam = 'overview-user-view' | 'overview-fitted' | 'wearer-overview' | 'wearer-detail'

type ExportMapRenderConfig = {
  selectedDeviceIds?: number[]
  focusedDeviceId?: number
  showTracks: boolean
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
  fitToSelectedPositions: boolean
  fitToFocusedDevicePositions: boolean
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

type MapImagesApi = {
  applyPreset: (preset: PresetParam, deviceId?: string) => void
  applyCapturedMapState: (state: CapturedMapState) => void
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

const dispatchCheckboxChange = (checkbox: HTMLInputElement) => {
  checkbox.dispatchEvent(new Event('change', { bubbles: true }))
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
      dispatchCheckboxChange(checkbox)
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

const getSelectedDeviceIdsFromUrl = (): number[] | undefined => {
  const params = new URLSearchParams(window.location.search)
  const deviceIdsParamValues = params.get('deviceIds')

  if (!deviceIdsParamValues) return undefined

  const deviceIds = deviceIdsParamValues
    .split(',')
    .map(value => Number(value.trim()))
    .filter(value => Number.isFinite(value))

  return deviceIds.length > 0 ? deviceIds : undefined
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

const fitToDevicePositions = (emMap: EmMap, crimePosition: Position, devicePositions: Array<Position>) => {
  emMap.fitToPoints([crimePosition, ...devicePositions], {
    padding: 40,
    maxZoom: 20,
    animate: false,
  })

  const map = emMap.olMapInstance
  const mapView = map?.getView()

  if (!map || !mapView) return

  const resolution = mapView.getResolution()
  if (typeof resolution === 'number') {
    mapView.setResolution(resolution * 1.3)
  }

  map.renderSync()
}

const setCheckboxCheckedState = (name: string, value: string, checked: boolean) => {
  const checkbox = document.querySelector<HTMLInputElement>(`input[type="checkbox"][name="${name}"][value="${value}"]`)

  if (!checkbox) return

  checkbox.checked = checked
  dispatchCheckboxChange(checkbox)
}

const setAllDeviceVisibility = (deviceIds: number[], selectedDeviceIds: Set<number>) => {
  deviceIds.forEach(deviceId => {
    setCheckboxCheckedState('device-wearer-toggle', `device-wearer-${deviceId}`, selectedDeviceIds.has(deviceId))
  })
}

const setTrackVisibility = (deviceIds: number[], visibleDeviceIds: Set<number>) => {
  deviceIds.forEach(deviceId => {
    setCheckboxCheckedState('device-wearer-tracks', `device-wearer-tracks-${deviceId}`, visibleDeviceIds.has(deviceId))
  })
}

const setAnalysisVisibility = (showConfidenceCircles: boolean, showLocationNumbering: boolean) => {
  setCheckboxCheckedState('analysis-toggles', 'device-wearer-circles-', showConfidenceCircles)
  setCheckboxCheckedState('analysis-toggles', 'device-wearer-labels-', showLocationNumbering)
}

// Build map render config based on preset selection and URL parameters
const getRenderConfigForPreset = (
  preset: PresetParam,
  selectedDeviceIds: number[] | undefined,
  focusedDeviceId?: number,
): ExportMapRenderConfig => {
  if (preset === 'overview-user-view') {
    return {
      selectedDeviceIds,
      showTracks: true,
      showConfidenceCircles: true,
      showLocationNumbering: true,
      fitToSelectedPositions: false,
      fitToFocusedDevicePositions: false,
    }
  }

  if (preset === 'overview-fitted') {
    return {
      selectedDeviceIds,
      showTracks: false,
      showConfidenceCircles: true,
      showLocationNumbering: true,
      fitToSelectedPositions: true,
      fitToFocusedDevicePositions: false,
    }
  }

  if (preset === 'wearer-overview') {
    return {
      selectedDeviceIds: focusedDeviceId ? [focusedDeviceId] : selectedDeviceIds,
      focusedDeviceId,
      showTracks: true,
      showConfidenceCircles: true,
      showLocationNumbering: true,
      fitToSelectedPositions: false,
      fitToFocusedDevicePositions: false,
    }
  }

  return {
    selectedDeviceIds: focusedDeviceId ? [focusedDeviceId] : selectedDeviceIds,
    focusedDeviceId,
    showTracks: false,
    showConfidenceCircles: true,
    showLocationNumbering: true,
    fitToSelectedPositions: false,
    fitToFocusedDevicePositions: true,
  }
}

// Apply map render config to the map view by updating checkbox states and fitting view if needed
const applyRenderConfig = (
  emMap: EmMap,
  data: MapData,
  allDeviceIds: number[],
  config: ExportMapRenderConfig,
  crimeCentre: Coordinate,
) => {
  const selectedDeviceIds = new Set(config.selectedDeviceIds ?? allDeviceIds)
  const visibleTrackDeviceIds = config.showTracks ? selectedDeviceIds : new Set<number>()

  setAllDeviceVisibility(allDeviceIds, selectedDeviceIds)
  setTrackVisibility(allDeviceIds, visibleTrackDeviceIds)
  setAnalysisVisibility(config.showConfidenceCircles, config.showLocationNumbering)

  if (config.fitToSelectedPositions) {
    const positions =
      data.matching?.deviceWearers
        .filter(deviceWearer => selectedDeviceIds.has(deviceWearer.deviceId))
        .flatMap(deviceWearer => deviceWearer.positions) ?? []

    fitToDevicePositions(emMap, data.crimePosition, positions)
    return
  }

  if (config.fitToFocusedDevicePositions && typeof config.focusedDeviceId === 'number') {
    const focusedDeviceWearer = data.matching?.deviceWearers.find(
      deviceWearer => deviceWearer.deviceId === config.focusedDeviceId,
    )

    fitToDevicePositions(emMap, data.crimePosition, focusedDeviceWearer?.positions ?? [])
    return
  }

  setCrimeDefaultView(emMap, crimeCentre)
}

const initialiseProximityAlertView = async () => {
  const data = readJsonFromScript<MapData>('map-data')

  if (!data) {
    return
  }

  const emMap = queryElement(document, 'em-map') as EmMap
  const isHeadless = isHeadlessCapture()
  const selectedDeviceIdsFromUrl = getSelectedDeviceIdsFromUrl()

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const { centre } = addCrimeLayers(emMap, data.crimePosition)

  setCrimeDefaultView(emMap, centre)

  const allDeviceIds: number[] = []

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
      allDeviceIds.push(deviceWearer.deviceId)
      colourIndex += 1
    }
  }

  const win = window as unknown as { mapImages?: MapImagesApi }
  win.mapImages = {
    applyPreset: (preset: PresetParam, deviceId?: string) => {
      const parsedDeviceId =
        typeof deviceId === 'string' && deviceId.trim() !== '' ? Number(deviceId.trim()) : undefined

      const config = getRenderConfigForPreset(preset, selectedDeviceIdsFromUrl, parsedDeviceId)
      applyRenderConfig(emMap, data, allDeviceIds, config, centre)
    },
    applyCapturedMapState: (state: CapturedMapState) => {
      applyCapturedMapState(emMap, state)
    },
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
