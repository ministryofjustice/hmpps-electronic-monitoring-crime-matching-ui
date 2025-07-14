import { fromLonLat, transformExtent } from 'ol/proj'

// The EPSG:4326 projected bounds of the United Kingdom
// https://epsg.io/27700
const ukProjectedBounds = [-9.01, 49.75, 2.01, 61.01]
// https://en.wikipedia.org/wiki/Centre_points_of_the_United_Kingdom
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
      min: 7, // OS Maps API only supports ESPG:8357 tile sets with a min zoom of 7 and max of 20
      max: 20,
    },
  },
}

export default config
