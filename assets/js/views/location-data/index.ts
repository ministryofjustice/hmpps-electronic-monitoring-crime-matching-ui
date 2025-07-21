import axios from 'axios'
import ElectronicMonitoringMap from '../../map/index'
import LocationsLayer from './layers/locations'
import TracksLayer from './layers/tracks'
import ConfidenceLayer from './layers/confidence'
import NumberingLayer from './layers/numbering'
import LocationPointerInteraction from './interactions/locationPointer'
import LocationMetadataOverlay from './overlays/locationMetadata'
import createLayerVisibilityToggle from './controls/layerVisibilityToggle'
import { queryElement } from '../../utils/utils'

const getAccessToken = () => {
  return axios.get('/map/token').then(response => response.data.access_token)
}

const initialiseLocationDataView = async () => {
  const mapContainer = queryElement(document, HTMLDivElement, '[data-module="app-map"]')
  const overlay = queryElement(mapContainer, HTMLDivElement, '.app-map__overlay')
  const overlayTemplate = queryElement(mapContainer, HTMLTemplateElement, '#map-overlay-template')

  // Parse data from element
  const points = mapContainer.getAttribute('data-points') || '[]'
  const lines = mapContainer.getAttribute('data-lines') || '[]'
  const tileUrl = mapContainer.getAttribute('data-tile-url') || ''

  const token = await getAccessToken()

  // Build the map
  const locationsLayer = new LocationsLayer(points)
  const locationSource = locationsLayer.getSource()
  const tracksLayer = new TracksLayer(lines)
  const confidenceLayer = new ConfidenceLayer(points)
  const locationMetadataOverlay = new LocationMetadataOverlay(overlay, overlayTemplate)
  const locationNumberingLayer = new NumberingLayer(points)

  const map = new ElectronicMonitoringMap({
    target: 'app-map',
    osMapsTileUrl: tileUrl,
    osMapsAccessToken: token,
    layers: [locationsLayer, tracksLayer, confidenceLayer, locationNumberingLayer],
    overlays: [locationMetadataOverlay],
    interactions: [new LocationPointerInteraction(locationMetadataOverlay)],
  })

  // Focus on geolocation data
  if (locationSource) {
    map.getView().fit(locationSource.getExtent(), {
      maxZoom: 16,
      padding: [30, 30, 30, 30],
      size: map.getSize(),
    })
  }

  // Add controls
  createLayerVisibilityToggle('#locations', locationsLayer, locationMetadataOverlay)
  createLayerVisibilityToggle('#tracks', tracksLayer)
  createLayerVisibilityToggle('#confidence', confidenceLayer)
  createLayerVisibilityToggle('#numbering', locationNumberingLayer)

  // Expose map to Cypress for testing
  const testEnv = typeof window !== 'undefined' && !!window.Cypress

  if (testEnv) {
    map.on('rendercomplete', () => {
      mapContainer.olMapForCypress = map
      mapContainer.dispatchEvent(
        new CustomEvent('map:render:complete', {
          detail: { mapInstance: map },
        }),
      )
    })
  }
}

export default initialiseLocationDataView
