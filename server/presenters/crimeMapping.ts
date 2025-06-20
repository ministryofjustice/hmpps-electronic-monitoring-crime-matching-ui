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
      confidence: location.confidence,
    },
    geometry: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
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
            [location.longitude, location.latitude],
            [locations[index + 1].longitude, locations[index + 1].latitude],
          ],
        },
      })
    }
    return acc
  }, [] as Array<LineFeature>),
})

export default createGeoJsonData
