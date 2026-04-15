import { Component } from 'govuk-frontend'
import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { queryElement } from '../utils/utils'

class MapLayerVisibilityToggle extends Component {
  private map: EmMap

  constructor($root: Element) {
    super($root)

    // Handle events
    this.$root.addEventListener('change', event => this.handleChange(event))

    this.map = queryElement(document, 'em-map') as EmMap
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    const re = new RegExp(layerId)
    const layers = this.map.olMapInstance?.getAllLayers() || []
    const layerGroups = this.map.olMapInstance?.getLayerGroup().getLayers().getArray() || []

    for (const layer of [...layerGroups, ...layers]) {
      if (re.test(layer.get('title'))) {
        layer.setVisible(visible)
      }
    }
  }

  handleChange(event: Event) {
    const $clickedInput = event.target

    // Ignore clicks on things that aren't checkbox inputs
    if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== 'checkbox') {
      return
    }

    this.setLayerVisibility($clickedInput.value, $clickedInput.checked)
  }

  static moduleName = 'map-layer-visibility-toggle'
}

export default MapLayerVisibilityToggle
