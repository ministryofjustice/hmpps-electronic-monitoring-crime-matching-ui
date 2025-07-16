import PointerInteraction from 'ol/interaction/Pointer'

class LocationPointerInteraction extends PointerInteraction {
  constructor(overlay) {
    super()
    this.overlay = overlay
  }

  // eslint-disable-next-line class-methods-use-this
  getIntersectingLocation({ map, pixel }) {
    return map.getFeaturesAtPixel(pixel).find(feature => feature.get('type') === 'location-point')
  }

  handleMoveEvent(event) {
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

  handleDownEvent(event) {
    const location = this.getIntersectingLocation(event)
    const geometry = location ? location.getGeometry() : undefined
    const coordinate = geometry ? geometry.getCoordinates() : undefined
    const properties = location ? location.getProperties() : undefined

    if (location && coordinate) {
      this.overlay.showAtCoordinate(coordinate, properties)
    } else {
      this.overlay.close()
    }

    return true
  }
}

export default LocationPointerInteraction
