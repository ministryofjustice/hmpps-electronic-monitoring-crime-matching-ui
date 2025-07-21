import { Overlay } from 'ol'
import LayerGroup from 'ol/layer/Group'
import Layer from 'ol/layer/Layer'

const toggleVisibility = (layer: Layer | LayerGroup, overlay?: Overlay) => () => {
  const visible = layer.getVisible()

  if (visible && overlay) {
    overlay.setPosition(undefined)
  }

  layer.setVisible(!visible)
}

const createLayerVisibilityToggle = (selector: string, layer: Layer | LayerGroup, overlay?: Overlay) => {
  const element = document.querySelector(selector) as HTMLElement

  if (element !== null) {
    element.onchange = toggleVisibility(layer, overlay)
  }
}

export default createLayerVisibilityToggle
