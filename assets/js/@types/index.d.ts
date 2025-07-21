import { Map } from 'ol'

declare global {
  interface Element {
    olMapForCypress?: Map
  }

  interface Window {
    Cypress?: unknown
  }
}
