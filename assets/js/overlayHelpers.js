import Overlay from 'ol/Overlay'
import { convertRadiansToDegrees, formatDisplayValue } from './utils/utils'

function createOverlay($module, $map) {
  const $overlay = $module.querySelector('.app-map__overlay')
  const $overlayTemplate = $module.querySelector('#map-overlay-template')

  if (!$overlay || !$overlayTemplate) return null

  const overlay = new Overlay({
    element: $overlay,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
    offset: [0, -22],
    positioning: 'bottom-center',
  })
  $map.addOverlay(overlay)

  // Ensure the overlay starts hidden
  overlay.setPosition(undefined)

  function showOverlayAtCoordinate(coordinate, props) {
    const html = $overlayTemplate.innerHTML
      .replace('{{ altitude }}', formatDisplayValue(props.altitude, 'm', 'N/A'))
      .replace('{{ speed }}', formatDisplayValue(props.speed, ' km/h', 'N/A'))
      .replace('{{ direction }}', formatDisplayValue(convertRadiansToDegrees(props.direction), '°', 'N/A'))
      .replace('{{ geolocationMechanism }}', formatDisplayValue(props.geolocationMechanism, '', 'N/A'))
      .replace('{{ timestamp }}', formatDisplayValue(props.timestamp, '', 'N/A'))
      .replace('{{ confidenceCircle }}', formatDisplayValue(props.confidenceCircle, 'm', 'N/A'))
      .replace('{{ latitude }}', formatDisplayValue(props.point.latitude, '', 'N/A'))
      .replace('{{ longitude }}', formatDisplayValue(props.point.longitude, '', 'N/A'))

    $overlay.innerHTML = html

    const $closeBtn = $overlay.querySelector('.app-map__overlay-close')
    if ($closeBtn) {
      $closeBtn.addEventListener('click', () => {
        overlay.setPosition(undefined)
      })
    }

    overlay.setPosition(coordinate)
  }

  $map.on('click', evt => {
    let selectedFeature = null

    $map.forEachFeatureAtPixel(evt.pixel, feature => {
      const features = feature.get('features')
      if (features.length === 1) {
        const singleFeature = features[0]
        if (singleFeature.get('type') === 'location-point') {
          selectedFeature = singleFeature
          return true
        }
      }
      return false
    })

    if (!selectedFeature) {
      overlay.setPosition(undefined)
      return
    }

    const geometry = selectedFeature.getGeometry()
    const coordinate = geometry ? geometry.getCoordinates() : undefined

    if (!coordinate) {
      overlay.setPosition(undefined)
      return
    }

    const props = selectedFeature.getProperties()
    showOverlayAtCoordinate(coordinate, props)
  })

  return overlay
}

export default createOverlay
