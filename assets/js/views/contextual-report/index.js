import axios from 'axios'
import ElectronicMonitoringMap from '../../map/index'
import LocationsLayer from './layers/locations'
import TracksLayer from './layers/tracks'
import ConfidenceLayer from './layers/confidence'
import createLayerVisibilityToggle from './controls/layerVisibilityToggle'

const getToken = () => {
  return axios.get('/map/token').then(response => response.data.access_token)
}

const initialiseContextualReportView = async () => {
  console.log('initialise')

  const el = document.querySelector('[data-module="app-map"]')
  const points = JSON.parse(el.getAttribute('data-points'))
  const lines = JSON.parse(el.getAttribute('data-lines'))
  const tileUrl = el.getAttribute('data-tile-url')
  const token = await getToken()
  const locationsLayer = new LocationsLayer(points)
  const tracksLayer = new TracksLayer(lines)
  const confidenceLayer = new ConfidenceLayer(points)
  const map = new ElectronicMonitoringMap('app-map', tileUrl, token)

  map.addLayer(locationsLayer)
  map.addLayer(tracksLayer)
  map.addLayer(confidenceLayer)
  map.render()

  // Focus on geolocation data
  map.map.getView().fit(locationsLayer.getSource().getExtent(), {
    maxZoom: 16,
    padding: [30, 30, 30, 30],
    size: map.map.getSize(),
  })

  createLayerVisibilityToggle('#locations', locationsLayer)
  createLayerVisibilityToggle('#tracks', tracksLayer)
  createLayerVisibilityToggle('#confidence', confidenceLayer)
}

export default initialiseContextualReportView
