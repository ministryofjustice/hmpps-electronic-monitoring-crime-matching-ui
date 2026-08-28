import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import type { CapturedMapState } from './crimeVersion'

// All export screenshots (overview and per-device-wearer) are captured from the same
// viewport (capturedMapState), so the only thing that varies between them is which
// device wearers'/tracks' layers are visible.
export type ExportMapRenderConfig = {
  selectedDeviceIds: number[]
  selectedTrackDeviceIds: number[]
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
  capturedMapState: CapturedMapState
}

type MapImagesApi = {
  applyRenderConfig: (config: ExportMapRenderConfig) => Promise<void>
}

type InitialiseProximityAlertExportViewArgs = {
  emMap: EmMap
  mapDeviceIds: number[]
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

// Applies headless export settings (hide UI controls and resize map to match captured dimensions)
// before rendering screenshots.
const applyHeadlessMapMode = (emMap: EmMap) => {
  const map = emMap.olMapInstance
  if (!map) return

  const headlessMapSize = getHeadlessMapSizeFromUrl()
  if (headlessMapSize) {
    const mapElement = emMap as unknown as HTMLElement
    mapElement.style.width = `${headlessMapSize.widthPx}px`
    mapElement.style.height = `${headlessMapSize.heightPx}px`
    map.updateSize()
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
// All export screenshots use the same captured viewport; only layer visibility (which
// device wearers/tracks are shown) differs between images.
const applyRenderConfig = async ({
  emMap,
  mapDeviceIds,
  config,
  applyCapturedMapState,
}: {
  emMap: EmMap
  mapDeviceIds: number[]
  config: ExportMapRenderConfig
  applyCapturedMapState: (state: CapturedMapState) => void
}): Promise<void> => {
  const selectedDeviceIds = new Set(config.selectedDeviceIds ?? mapDeviceIds)
  const selectedTrackDeviceIds = new Set(config.selectedTrackDeviceIds ?? selectedDeviceIds)

  applyCapturedMapState(config.capturedMapState)

  await new Promise<void>(resolve => {
    window.requestAnimationFrame(() => resolve())
  })

  setDeviceWearerLayersVisible({
    emMap,
    mapDeviceIds,
    selectedDeviceIds,
    selectedTrackDeviceIds,
    showConfidenceCircles: config.showConfidenceCircles,
    showLocationNumbering: config.showLocationNumbering,
  })

  emMap.olMapInstance?.renderSync()
}

// Initialises the headless export API used in the Service by Playwright to configure screenshots.
const initialiseProximityAlertExportView = ({
  emMap,
  mapDeviceIds,
  applyCapturedMapState,
}: InitialiseProximityAlertExportViewArgs) => {
  applyHeadlessMapMode(emMap)

  const win = window as unknown as { mapImages?: MapImagesApi }
  win.mapImages = {
    applyRenderConfig: async (config: ExportMapRenderConfig) => {
      await applyRenderConfig({
        emMap,
        mapDeviceIds,
        config,
        applyCapturedMapState,
      })
    },
  }
}

export default initialiseProximityAlertExportView
