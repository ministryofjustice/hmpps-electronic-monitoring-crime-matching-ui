import { formatDisplayValue, convertRadiansToDegrees } from './formatters'
import Position from '../../types/entities/position'

export default function annotatePositionsWithDisplayProperties(positions: Array<Position>): Array<Position> {
  return positions.map(position => ({
    ...position,

    // Overlay template
    overlayTitleTemplateId: 'overlay-title-mdss-location',
    overlayBodyTemplateId: 'overlay-body-mdss-location',

    // Display values
    displaySpeed: formatDisplayValue(position.speed, ' km/h', 'N/A'),
    displayDirection: formatDisplayValue(convertRadiansToDegrees(position.direction), '°', 'N/A'),
    displayGeolocationMechanism: formatDisplayValue(position.geolocationMechanism, '', 'N/A'),
    displayTimestamp: formatDisplayValue(position.timestamp, '', 'N/A'),
    displayConfidence: formatDisplayValue(position.precision, 'm', 'N/A'),
    displayLatitude: formatDisplayValue(position.latitude, '', 'N/A'),
    displayLongitude: formatDisplayValue(position.longitude, '', 'N/A'),
  }))
}
