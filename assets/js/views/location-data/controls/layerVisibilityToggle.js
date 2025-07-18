const toggleVisibility = (layer, overlay) => () => {
  const visible = layer.getVisible()

  if (visible && overlay) {
    overlay.setPosition(null)
  }

  layer.setVisible(!visible)
}

const createLayerVisibilityToggle = (selector, layer, overlay) => {
  const element = document.querySelector(selector)

  if (element !== null) {
    element.onchange = toggleVisibility(layer, overlay)
  }
}

export default createLayerVisibilityToggle
