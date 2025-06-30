import Location from '../types/location'

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
    altitude?: number
    speed?: number
    direction?: number
    mechanism?: string
    recordedTime?: string
    confidence: number
    latitude: number
    longitude: number
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
      altitude: location.altitude,
      speed: location.speed,
      direction: location.direction,
      mechanism: location.mechanism,
      recordedTime: location.recordedTime,
      confidence: location.confidenceCircle,
      latitude: location.latitude,
      longitude: location.longitude,
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
