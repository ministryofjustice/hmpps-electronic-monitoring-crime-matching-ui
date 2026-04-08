import { Component } from 'govuk-frontend'
import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { queryElement } from '../utils/utils'

class MapLayerVisibilityToggle extends Component {
  private map: EmMap

  constructor($root: Element) {
    super($root)

    // Handle events
    this.$root.addEventListener('click', event => this.handleClick(event))

    this.map = queryElement(document, 'em-map') as EmMap
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    this.map.getLayer(layerId)?.getPrimaryLayer().setVisible(visible)
  }

  handleClick(event: MouseEvent) {
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
