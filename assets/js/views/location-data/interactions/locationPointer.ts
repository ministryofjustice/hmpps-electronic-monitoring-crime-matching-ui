import PointerInteraction from 'ol/interaction/Pointer'
import { Feature, MapBrowserEvent } from 'ol'
import { Point } from 'ol/geom'
import { FeatureLike } from 'ol/Feature'

export type LocationFeatureCallback = (feature: Feature<Point>, event: MapBrowserEvent) => void

// Type guard ensures feature has correct geometry and therefore has coordinates
const isPointFeature = (feature: FeatureLike | undefined): feature is Feature<Point> => {
  return feature?.getGeometry() instanceof Point
}

class LocationPointerInteraction extends PointerInteraction {
  constructor(
    private readonly onClick?: LocationFeatureCallback,
    private readonly onHover?: LocationFeatureCallback,
  ) {
    super()
  }

  getIntersectingLocation({ map, pixel }: MapBrowserEvent): Feature<Point> | undefined {
    return map
      .getFeaturesAtPixel(pixel)
      .filter(isPointFeature)
      .find(feature => feature.get('type') === 'location-point')
  }

  handleMoveEvent(event: MapBrowserEvent) {
    const { dragging, map } = event

    if (dragging) {
      return true
    }

    const location = this.getIntersectingLocation(event)

    if (location) {
      map.getTargetElement().style.cursor = 'pointer'
    } else {
      map.getTargetElement().style.cursor = ''
    }

    return true
  }

  handleDownEvent(event: MapBrowserEvent) {
    const location = this.getIntersectingLocation(event)

    if (location && this.onClick) {
      this.onClick(location, event)
      return true
    }

    return false
  }
}

export default LocationPointerInteraction
