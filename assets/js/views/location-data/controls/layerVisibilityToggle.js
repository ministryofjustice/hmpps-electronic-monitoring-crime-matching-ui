const toggleVisibility = layer => () => {
  layer.setVisible(!layer.getVisible())
}

const createLayerVisibilityToggle = (selector, layer) => {
  const element = document.querySelector(selector)

  if (element !== null) {
    element.onchange = toggleVisibility(layer)
  }
}

export default createLayerVisibilityToggle
