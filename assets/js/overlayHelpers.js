import Overlay from 'ol/Overlay'
import formatDisplayValue from './utils/utils'

function addOverlayHandler($module, $map) {
  const $overlay = $module.querySelector('.app-map__overlay')
  if (!$overlay) return

  const $overlayTemplate = $module.querySelector('#map-overlay-template')
  if (!$overlayTemplate) return

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
      .replace('{{ direction }}', formatDisplayValue(props.direction, '°', 'N/A'))
      .replace('{{ mechanism }}', formatDisplayValue(props.mechanism, '', 'N/A'))
      .replace('{{ recordedTime }}', formatDisplayValue(props.recordedTime, '', 'N/A'))
      .replace('{{ confidence }}', formatDisplayValue(props.confidence, 'm', 'N/A'))
      .replace('{{ latitude }}', formatDisplayValue(props.latitude, '', 'N/A'))
      .replace('{{ longitude }}', formatDisplayValue(props.longitude, '', 'N/A'))

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
      if (feature.get('type') === 'location-point') {
        selectedFeature = feature
        return true
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
}

export default addOverlayHandler
