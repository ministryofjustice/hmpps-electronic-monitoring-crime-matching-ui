import { Location, Point } from '../types/location'

type Coordinate = [number, number]

type LineFeature = {
  type: 'Feature'
  id: string
  properties: {
    '@id': string
    direction: number
  }
  geometry: {
    type: 'LineString'
    coordinates: Array<Coordinate>
  }
}

type PointFeature = {
  type: 'Feature'
  id: string
  properties: {
    '@id': string
    speed?: number
    direction?: number
    geolocationMechanism?: number
    timestamp?: string
    confidence: number
    point: Point
  }
  geometry: {
    type: 'Point'
    coordinates: Coordinate
  }
}

type GeoJsonData = {
  points: Array<PointFeature>
  lines: Array<LineFeature>
}

const createGeoJsonData = (locations: Array<Location>): GeoJsonData => ({
  points: locations.map((location, index) => ({
    type: 'Feature',
    id: index.toString(),
    properties: {
      '@id': index.toString(),
      speed: location.speed,
      direction: location.direction,
      geolocationMechanism: location.geolocationMechanism,
      timestamp: location.timestamp,
      confidence: location.confidenceCircle,
      point: location.point,
    },
    geometry: {
      type: 'Point',
      coordinates: [location.point.longitude, location.point.latitude],
    },
  })),
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
