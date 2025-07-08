import Map from 'ol/Map'

export interface TestMapElement extends HTMLElement {
  olMapForCypress?: Map
  exposeMapToCypress?: (map: Map) => void
}

export function attachExposeHookToMapElement(): void {
  const waitForMapElement = () => {
    const el = document.querySelector('.app-map') as TestMapElement | null
    if (!el) {
      setTimeout(waitForMapElement, 50)
      return
    }

    el.exposeMapToCypress = function (map: Map): void {
      this.olMapForCypress = map
      this.dispatchEvent(new CustomEvent('olMap:ready', { detail: { mapInstance: map } }))
    }
  }

  waitForMapElement()
}
