import { Map } from 'ol'

type MapImagesApi = {
  defaultView: () => void
  proximityAlertImage1: () => void
  proximityAlertImage2: () => void
  ready: boolean
}

declare global {
  interface Element {
    map?: Map
  }

  interface Window {
    Cypress?: unknown
    headlessMapCapture?: boolean
    mapImages?: MapImagesApi
  }
}
