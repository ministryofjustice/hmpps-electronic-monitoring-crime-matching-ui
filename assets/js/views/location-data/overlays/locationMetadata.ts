import { Overlay } from 'ol'
import { Coordinate } from 'ol/coordinate'
import { convertRadiansToDegrees, formatDisplayValue } from '../../../utils/utils'

type LocationProperties = {
  altitude?: number
  speed?: number
  direction?: number
  geolocationMechanism?: number
  timestamp?: string
  confidenceCircle: number
  point: {
    latitude: number
    longitude: number
  }
  type: string
}

class LocationMetadataOverlay extends Overlay {
  constructor(
    element: HTMLElement,
    protected readonly template: HTMLElement,
  ) {
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
  }

  hasElement() {
    return this.getElement() !== undefined
  }

  showAtCoordinate(coordinate: Coordinate, props: LocationProperties) {
    this.updateContent(props)
    this.bindCloseEvent()
    this.setPosition(coordinate)
  }

  updateContent(props: LocationProperties) {
    const element = this.getElement()
    const html = this.template.innerHTML
      .replace('{{ altitude }}', formatDisplayValue(props.altitude, 'm', 'N/A'))
      .replace('{{ speed }}', formatDisplayValue(props.speed, ' km/h', 'N/A'))
      .replace('{{ direction }}', formatDisplayValue(convertRadiansToDegrees(props.direction), '°', 'N/A'))
      .replace('{{ geolocationMechanism }}', formatDisplayValue(props.geolocationMechanism, '', 'N/A'))
      .replace('{{ timestamp }}', formatDisplayValue(props.timestamp, '', 'N/A'))
      .replace('{{ confidenceCircle }}', formatDisplayValue(props.confidenceCircle, 'm', 'N/A'))
      .replace('{{ latitude }}', formatDisplayValue(props.point.latitude, '', 'N/A'))
      .replace('{{ longitude }}', formatDisplayValue(props.point.longitude, '', 'N/A'))

    if (element) {
      element.innerHTML = html
    }
  }

  bindCloseEvent() {
    const element = this.getElement()

    if (element) {
      const closeButton = element.querySelector('.app-map__overlay-close')

      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.close()
        })
      }
    }
  }

  close() {
    this.setPosition(undefined)
  }
}

export default LocationMetadataOverlay

export { LocationProperties }
