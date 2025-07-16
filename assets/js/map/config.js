import { fromLonLat, transformExtent } from 'ol/proj'

// Sourced from https://epsg.io/27700
const ukProjectedBounds = [-9.01, 49.75, 2.01, 61.01]

// Sourced from https://en.wikipedia.org/wiki/Centre_points_of_the_United_Kingdom
// (Whitendale Hanging Stones)
const ukCenter = [-2.547855, 54.00366]

const config = {
  view: {
    zoom: {
      min: 5,
      max: 20,
    },
    default: {
      zoom: 5,
      extent: transformExtent(ukProjectedBounds, 'EPSG:4326', 'EPSG:3857'),
      center: fromLonLat(ukCenter),
    },
  },
  tiles: {
    zoom: {
      min: 7,
      max: 20,
    },
  },
}

export default config
