import type { FeatureCollection, Feature, Point } from 'geojson'
import { formatDisplayValue, convertRadiansToDegrees } from './formatters'

export default function formatLocationData(geoJson: FeatureCollection): FeatureCollection {
  const features: Feature[] = geoJson.features.map(feature => {
    if (feature.geometry.type === 'Point') {
      const [lon, lat] = (feature.geometry as Point).coordinates

      return {
        ...feature,
        properties: {
          ...feature.properties,
          // Overlay template
          overlayTitleTemplateId: 'overlay-title-mdss-location',
          overlayBodyTemplateId: 'overlay-body-mdss-location',

          // Display values
          displaySpeed: formatDisplayValue(feature.properties?.speed, ' km/h', 'N/A'),
          displayDirection: formatDisplayValue(convertRadiansToDegrees(feature.properties?.direction), '°', 'N/A'),
          displayGeolocationMechanism: formatDisplayValue(feature.properties?.geolocationMechanism, '', 'N/A'),
          displayTimestamp: formatDisplayValue(feature.properties?.timestamp, '', 'N/A'),
          displayConfidence: formatDisplayValue(feature.properties?.confidence, 'm', 'N/A'),
          displayLatitude: formatDisplayValue(lat, '', 'N/A'),
          displayLongitude: formatDisplayValue(lon, '', 'N/A'),
        },
      }
    }
    return feature
  })

  return { ...geoJson, features }
}
