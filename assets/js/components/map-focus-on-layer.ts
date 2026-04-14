import { Component } from 'govuk-frontend'
import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { queryElement } from '../utils/utils'

class MapFocusOnLayer extends Component {
  private map: EmMap

  constructor($root: Element) {
    super($root)

    // Handle events
    this.$root.addEventListener('click', event => this.handleClick(event))

    this.map = queryElement(document, 'em-map') as EmMap
  }

  handleClick(event: MouseEvent) {
    event.preventDefault()

    // Check layer value is present
    const { layer } = this.$root.dataset
    if (!layer) {
      return
    }

    this.map.fitToLayer(layer, {
      padding: 80,
      maxZoom: 19,
    })
  }

  static moduleName = 'map-focus-on-layer'
}

export default MapFocusOnLayer
