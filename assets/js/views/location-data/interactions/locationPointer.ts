import PointerInteraction from 'ol/interaction/Pointer'
import { Feature, MapBrowserEvent } from 'ol'
import { Point } from 'ol/geom'
import { FeatureLike } from 'ol/Feature'
import LocationMetadataOverlay, { LocationProperties } from '../overlays/locationMetadata'

// Type guard ensures feature has correct geometry and therefore has coordinates
const isPointFeature = (feature: FeatureLike | undefined): feature is Feature<Point> => {
  return feature?.getGeometry() instanceof Point
}

// Properties in ol are loosely typed, so use a guard to ensure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isLocationProps = (props: { [k: string]: any } | undefined): props is LocationProperties => {
  if (props === undefined) {
    return false
  }

  return 'confidenceCircle' in props && 'point' in props && 'type' in props
}

class LocationPointerInteraction extends PointerInteraction {
  constructor(protected readonly overlay: LocationMetadataOverlay) {
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
    const geometry = location?.getGeometry()
    const coordinate = geometry?.getCoordinates()
    const properties = location?.getProperties()

    if (location && coordinate && isLocationProps(properties)) {
      this.overlay.showAtCoordinate(coordinate, properties)
      return true
    }
    this.overlay.close()

    return false
  }
}

export default LocationPointerInteraction
