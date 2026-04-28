import { EmMap, Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import type { CapturedMapState, MapData } from './crimeVersion'

type ExportMapFitMode = 'none' | 'selected-device-wearers' | 'focused-device-wearer'

export type ExportMapRenderConfig = {
  selectedDeviceIds: number[]
  selectedTrackDeviceIds: number[]
  focusedDeviceId?: number
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
  fitMode: ExportMapFitMode
  capturedMapState?: CapturedMapState
}

type MapImagesApi = {
  applyRenderConfig: (config: ExportMapRenderConfig) => Promise<void>
}

type InitialiseProximityAlertExportViewArgs = {
  emMap: EmMap
  data: MapData
  mapDeviceIds: number[]
  setCrimeDefaultView: () => void
  applyCapturedMapState: (state: CapturedMapState) => void
}

type OlLayerLike = {
  get?: (key: string) => unknown
  setVisible?: (visible: boolean) => void
  getLayers?: () => {
    getArray: () => OlLayerLike[]
  }
}

// Reads map dimensions from the headless export URL to match screenshot size to the user's original map view.
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
  const { shadowRoot } = emMap
  if (!shadowRoot) return

  const controls = shadowRoot.querySelectorAll<HTMLElement>('.ol-control, .ol-attribution')
  controls.forEach(controlEl => {
    const el = controlEl
    el.style.display = 'none'
  })
}

// Applies headless export settings (hide UI controls and resize map to match captured dimensions)
// before rendering screenshots.
const applyHeadlessMapMode = (emMap: EmMap) => {
  const map = emMap.olMapInstance
  if (!map) return

  applyHeadlessUiTweaks(emMap)

  const headlessMapSize = getHeadlessMapSizeFromUrl()
  if (headlessMapSize) {
    const mapElement = emMap as unknown as HTMLElement
    mapElement.style.width = `${headlessMapSize.widthPx}px`
    mapElement.style.height = `${headlessMapSize.heightPx}px`
    map.updateSize()
  }

  map.renderSync()
}

// Fits the map view to the crime marker and supplied device wearer positions.
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

// Gets the identifier used to classify and match map layers.
const getLayerKey = (layer: OlLayerLike): string => {
  const id = layer.get?.('id')
  const title = layer.get?.('title')

  if (typeof id === 'string' && id.length > 0) return id
  if (typeof title === 'string' && title.length > 0) return title

  return ''
}

// Recursively traverses a layer and all child layers, applying a callback.
const traverseLayers = (layer: OlLayerLike, callback: (layer: OlLayerLike) => void) => {
  callback(layer)

  layer
    .getLayers?.()
    .getArray()
    .forEach(childLayer => traverseLayers(childLayer, callback))
}

// Applies a callback to every map layer, including nested child layers.
const forEachMapLayer = (emMap: EmMap, callback: (layer: OlLayerLike) => void) => {
  const layers = emMap.olMapInstance?.getLayers().getArray() as OlLayerLike[] | undefined

  layers?.forEach(layer => traverseLayers(layer, callback))
}

// Checks whether a layer key belongs to the given device wearer.
const layerKeyContainsDeviceId = (layerKey: string, deviceId: number): boolean => {
  return layerKey.includes(String(deviceId))
}

// Checks whether a layer represents device wearer tracks.
const isTracksLayer = (layerKey: string): boolean => {
  const normalised = layerKey.toLowerCase()

  return normalised.includes('track')
}

// Checks whether a layer represents confidence circles.
const isConfidenceCirclesLayer = (layerKey: string): boolean => {
  const normalised = layerKey.toLowerCase()

  return normalised.includes('confidence') || normalised.includes('circle')
}

// Checks whether a layer represents location numbering labels.
const isLocationNumberingLayer = (layerKey: string): boolean => {
  const normalised = layerKey.toLowerCase()

  return normalised.includes('label') || normalised.includes('number') || normalised.includes('text')
}

// Checks whether a layer belongs to the given device wearer.
const isDeviceWearerLayer = (layerKey: string, deviceId: number): boolean => {
  return layerKeyContainsDeviceId(layerKey, deviceId)
}

// Applies export visibility rules to device wearer layers.
const setDeviceWearerLayersVisible = ({
  emMap,
  mapDeviceIds,
  selectedDeviceIds,
  selectedTrackDeviceIds,
  showConfidenceCircles,
  showLocationNumbering,
}: {
  emMap: EmMap
  mapDeviceIds: number[]
  selectedDeviceIds: Set<number>
  selectedTrackDeviceIds: Set<number>
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
}) => {
  forEachMapLayer(emMap, layer => {
    const layerKey = getLayerKey(layer)
    if (!layerKey) return

    const matchingDeviceId = mapDeviceIds.find(deviceId => isDeviceWearerLayer(layerKey, deviceId))
    if (typeof matchingDeviceId !== 'number') return

    const isSelectedDeviceWearer = selectedDeviceIds.has(matchingDeviceId)

    if (!isSelectedDeviceWearer) {
      layer.setVisible?.(false)
      return
    }

    if (isTracksLayer(layerKey)) {
      layer.setVisible?.(selectedTrackDeviceIds.has(matchingDeviceId))
      return
    }

    if (isConfidenceCirclesLayer(layerKey)) {
      layer.setVisible?.(showConfidenceCircles)
      return
    }

    if (isLocationNumberingLayer(layerKey)) {
      layer.setVisible?.(showLocationNumbering)
      return
    }

    layer.setVisible?.(true)
  })
}

// Applies a screenshot-specific render config to layer visibility and map view.
const applyRenderConfig = async ({
  emMap,
  data,
  mapDeviceIds,
  config,
  setCrimeDefaultView,
  applyCapturedMapState,
}: {
  emMap: EmMap
  data: MapData
  mapDeviceIds: number[]
  config: ExportMapRenderConfig
  setCrimeDefaultView: () => void
  applyCapturedMapState: (state: CapturedMapState) => void
}): Promise<void> => {
  const selectedDeviceIds = new Set(config.selectedDeviceIds ?? mapDeviceIds)
  const selectedTrackDeviceIds = new Set(config.selectedTrackDeviceIds ?? selectedDeviceIds)

  const applyLayerVisibility = () => {
    setDeviceWearerLayersVisible({
      emMap,
      mapDeviceIds,
      selectedDeviceIds,
      selectedTrackDeviceIds,
      showConfidenceCircles: config.showConfidenceCircles,
      showLocationNumbering: config.showLocationNumbering,
    })
  }

  if (config.capturedMapState) {
    applyCapturedMapState(config.capturedMapState)

    await new Promise<void>(resolve => {
      window.requestAnimationFrame(() => resolve())
    })

    applyLayerVisibility()
    emMap.olMapInstance?.renderSync()
    return
  }

  applyLayerVisibility()

  if (config.fitMode === 'selected-device-wearers') {
    const positions =
      data.matching?.deviceWearers
        .filter(deviceWearer => selectedDeviceIds.has(deviceWearer.deviceId))
        .flatMap(deviceWearer => deviceWearer.positions) ?? []

    fitToDevicePositions(emMap, data.crimePosition, positions)
    return
  }

  if (config.fitMode === 'focused-device-wearer' && typeof config.focusedDeviceId === 'number') {
    const focusedDeviceWearer = data.matching?.deviceWearers.find(
      deviceWearer => deviceWearer.deviceId === config.focusedDeviceId,
    )

    fitToDevicePositions(emMap, data.crimePosition, focusedDeviceWearer?.positions ?? [])
    return
  }

  setCrimeDefaultView()
}

// Initialises the headless export API used in the Service by Playwright to configure screenshots.
const initialiseProximityAlertExportView = ({
  emMap,
  data,
  mapDeviceIds,
  setCrimeDefaultView,
  applyCapturedMapState,
}: InitialiseProximityAlertExportViewArgs) => {
  applyHeadlessMapMode(emMap)

  const win = window as unknown as { mapImages?: MapImagesApi }
  win.mapImages = {
    applyRenderConfig: async (config: ExportMapRenderConfig) => {
      await applyRenderConfig({
        emMap,
        data,
        mapDeviceIds,
        config,
        setCrimeDefaultView,
        applyCapturedMapState,
      })
    },
  }
}

export default initialiseProximityAlertExportView
