import LayerGroup from 'ol/layer/Group'
import Layer from 'ol/layer/Layer'
import { MojMap } from 'hmpps-open-layers-map'

const toggleVisibility = (layer: Layer | LayerGroup, mojMap?: MojMap) => () => {
  const visible = layer.getVisible()

  if (visible && mojMap) {
    mojMap.closeOverlay()
  }

  layer.setVisible(!visible)
}

const createLayerVisibilityToggle = (selector: string, layer: Layer | LayerGroup, mojMap?: MojMap) => {
  const element = document.querySelector(selector) as HTMLElement

  if (element !== null) {
    element.onchange = toggleVisibility(layer, mojMap)
  }
}

export default createLayerVisibilityToggle
