declare global {
  interface Window {
    mapImages?: {
      defaultView: () => void
      proximityAlertImage1: () => void
      proximityAlertImage2: () => void
      ready: boolean
    }
    headlessMapCapture?: boolean
  }
}
