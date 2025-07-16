import PointerInteraction from 'ol/interaction/Pointer'

class LocationHover extends PointerInteraction {
  // eslint-disable-next-line class-methods-use-this
  isIntersectingLocation({ map, pixel }) {
    return map.getFeaturesAtPixel(pixel).some(feature => feature.get('type') === 'location-point')
  }

  handleMoveEvent(event) {
    const { dragging, map } = event

    if (dragging) {
      return true
    }

    const hovering = this.isIntersectingLocation(event)

    if (hovering) {
      map.getTargetElement().style.cursor = 'pointer'
    } else {
      map.getTargetElement().style.cursor = ''
    }

    return true
  }

  handleDownEvent(event) {
    if (this.isIntersectingLocation(event)) {
      console.log('click')
    }

    return true
  }
}

export default LocationHover
