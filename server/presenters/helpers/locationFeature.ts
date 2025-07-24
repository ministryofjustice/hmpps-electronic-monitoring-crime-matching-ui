import { Location } from '../../types/location'
import { PointFeature } from '../../types/mapFeatures'
import { formatDisplayValue, convertRadiansToDegrees } from './formatters'

export default function presentLocationFeature(location: Location, index: number): PointFeature {
  return {
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
      type: 'location-point',
      sequenceNumber: location.sequenceNumber,

      // Display values used by the overlay template
      displaySpeed: formatDisplayValue(location.speed, ' km/h', 'N/A'),
      displayDirection: formatDisplayValue(convertRadiansToDegrees(location.direction), '°', 'N/A'),
      displayGeolocationMechanism: formatDisplayValue(location.geolocationMechanism, '', 'N/A'),
      displayTimestamp: formatDisplayValue(location.timestamp, '', 'N/A'),
      displayConfidence: formatDisplayValue(location.confidenceCircle, 'm', 'N/A'),
      displayLatitude: formatDisplayValue(location.point.latitude, '', 'N/A'),
      displayLongitude: formatDisplayValue(location.point.longitude, '', 'N/A'),
    },
    geometry: {
      type: 'Point',
      coordinates: [location.point.longitude, location.point.latitude],
    },
  }
}
