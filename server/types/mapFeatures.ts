import { Point } from './location'

export type Coordinate = [number, number]

export type LineFeature = {
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

export type PointFeature = {
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
    type: string
    overlayTemplateId?: string
    sequenceNumber: number

    displaySpeed?: string
    displayDirection?: string
    displayGeolocationMechanism?: string
    displayTimestamp?: string
    displayConfidence?: string
    displayLatitude?: string
    displayLongitude?: string
  }
  geometry: {
    type: 'Point'
    coordinates: Coordinate
  }
}

export type GeoJsonData = {
  points: Array<PointFeature>
  lines: Array<LineFeature>
}
