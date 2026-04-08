import LayerGroup from 'ol/layer/Group'
import Layer from 'ol/layer/Layer'
import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import type { ComposableLayer } from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'

type ToggleableLayer = Layer | LayerGroup | ComposableLayer

const resolveLayer = (layer: ToggleableLayer): Layer | LayerGroup => {
  if ('getPrimaryLayer' in layer) {
    return layer.getPrimaryLayer() as Layer | LayerGroup
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
