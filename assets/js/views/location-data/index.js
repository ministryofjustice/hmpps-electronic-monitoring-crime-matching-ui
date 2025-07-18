import axios from 'axios'
import ElectronicMonitoringMap from '../../map/index'
import LocationsLayer from './layers/locations'
import TracksLayer from './layers/tracks'
import ConfidenceLayer from './layers/confidence'
import LocationPointerInteraction from './interactions/locationPointer'
import LocationMetadataOverlay from './overlays/locationMetadata'
import createLayerVisibilityToggle from './controls/layerVisibilityToggle'

const getAccessToken = () => {
  return axios.get('/map/token').then(response => response.data.access_token)
}

const initialiseLocationDataView = async () => {
  const el = document.querySelector('[data-module="app-map"]')
  const overlay = el.querySelector('.app-map__overlay')
  const overlayTemplate = el.querySelector('#map-overlay-template')

  // Parse data from element
  const points = JSON.parse(el.getAttribute('data-points'))
  const lines = JSON.parse(el.getAttribute('data-lines'))
  const tileUrl = el.getAttribute('data-tile-url')

  const token = await getAccessToken()

  // Build the map
  const locationsLayer = new LocationsLayer(points)
  const tracksLayer = new TracksLayer(lines)
  const confidenceLayer = new ConfidenceLayer(points)
  const locationMetadataOverlay = new LocationMetadataOverlay(overlay, overlayTemplate)

  const map = new ElectronicMonitoringMap({
    target: 'app-map',
    osMapsTileUrl: tileUrl,
    osMapsAccessToken: token,
    layers: [locationsLayer, tracksLayer, confidenceLayer],
    overlays: [locationMetadataOverlay],
    interactions: [new LocationPointerInteraction(locationMetadataOverlay)],
  })

  // Focus on geolocation data
  map.getView().fit(locationsLayer.getSource().getExtent(), {
    maxZoom: 16,
    padding: [30, 30, 30, 30],
    size: map.getSize(),
  })

  // Add controls
  createLayerVisibilityToggle('#locations', locationsLayer, locationMetadataOverlay)
  createLayerVisibilityToggle('#tracks', tracksLayer)
  createLayerVisibilityToggle('#confidence', confidenceLayer)

  // Expose map to Cypress for testing
  const testEnv = typeof window !== 'undefined' && !!window.Cypress

  if (testEnv) {
    map.on('rendercomplete', () => {
      el.olMapForCypress = map
      el.dispatchEvent(
        new CustomEvent('map:render:complete', {
          detail: { mapInstance: map },
        }),
      )
    })
  }
}

export default initialiseLocationDataView
