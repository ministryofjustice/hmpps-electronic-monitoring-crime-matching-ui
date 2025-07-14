import { View } from 'ol'
import config from './config'

// The view is set up to display the entire UK
// The extent / centre / zoom will be updated when map is populated with features
const buildView = () => {
  return new View({
    projection: 'EPSG:3857',
    extent: config.view.default.extent,
    showFullExtent: true,
    minZoom: config.view.zoom.min,
    maxZoom: config.view.zoom.max,
    center: config.view.default.center,
    zoom: config.view.default.zoom,
  })
}

export default buildView
