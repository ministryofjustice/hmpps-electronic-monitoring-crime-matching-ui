import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import type { ComposableLayer } from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'

type VisibilityLayer = {
  getVisible(): boolean
  setVisible(v: boolean): void
}

// Accept either an OpenLayers layer or a composable layer
type ToggleableLayer = VisibilityLayer | ComposableLayer

const resolveLayer = (layer: ToggleableLayer): VisibilityLayer => {
  if ('getPrimaryLayer' in layer) {
    return layer.getPrimaryLayer()
  }
  return layer
}

const toggleVisibility = (layerInput: ToggleableLayer, emMap?: EmMap) => () => {
  const layer = resolveLayer(layerInput)

  const visible = layer.getVisible()

  if (visible && emMap) {
    emMap.closeOverlay()
  }

  layer.setVisible(!visible)
}

const createLayerVisibilityToggle = (selector: string, layer: ToggleableLayer, emMap?: EmMap) => {
  const element = document.querySelector(selector) as HTMLElement

  if (element !== null) {
    element.onchange = toggleVisibility(layer, emMap)
  }
}

export default createLayerVisibilityToggle
