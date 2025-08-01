import { Location } from '../types/location'
import presentLocationFeature from './helpers/locationFeature'
import { GeoJsonData, LineFeature } from '../types/mapFeatures'

const createGeoJsonData = (locations: Array<Location>): GeoJsonData => ({
  points: locations.map(presentLocationFeature),
  lines: locations.reduce((acc, location, index) => {
    if (index !== locations.length - 1) {
      acc.push({
        type: 'Feature',
        id: index.toString(),
        properties: {
          '@id': index.toString(),
          direction: location.direction,
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [location.point.longitude, location.point.latitude],
            [locations[index + 1].point.longitude, locations[index + 1].point.latitude],
          ],
        },
      })
    }
    return acc
  }, [] as Array<LineFeature>),
})

export default createGeoJsonData
