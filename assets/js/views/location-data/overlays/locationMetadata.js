import { Overlay } from 'ol'
import { convertRadiansToDegrees, formatDisplayValue } from '../../../utils/utils'

class LocationMetadataOverlay extends Overlay {
  constructor(element, template) {
    super({
      element,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      offset: [0, -22],
      positioning: 'bottom-center',
    })
    this.template = template
  }

  showAtCoordinate(coordinate, props) {
    this.updateContent(props)
    this.bindCloseEvent()
    this.setPosition(coordinate)
  }

  updateContent(props) {
    const html = this.template.innerHTML
      .replace('{{ altitude }}', formatDisplayValue(props.altitude, 'm', 'N/A'))
      .replace('{{ speed }}', formatDisplayValue(props.speed, ' km/h', 'N/A'))
      .replace('{{ direction }}', formatDisplayValue(convertRadiansToDegrees(props.direction), '°', 'N/A'))
      .replace('{{ geolocationMechanism }}', formatDisplayValue(props.geolocationMechanism, '', 'N/A'))
      .replace('{{ timestamp }}', formatDisplayValue(props.timestamp, '', 'N/A'))
      .replace('{{ confidenceCircle }}', formatDisplayValue(props.confidenceCircle, 'm', 'N/A'))
      .replace('{{ latitude }}', formatDisplayValue(props.point.latitude, '', 'N/A'))
      .replace('{{ longitude }}', formatDisplayValue(props.point.longitude, '', 'N/A'))

    this.getElement().innerHTML = html
  }

  bindCloseEvent() {
    const closeButton = this.getElement().querySelector('.app-map__overlay-close')

    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close()
      })
    }
  }

  close() {
    this.setPosition(undefined)
  }
}

export default LocationMetadataOverlay
