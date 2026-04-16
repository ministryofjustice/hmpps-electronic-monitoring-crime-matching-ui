import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { queryElement } from '../../utils/utils'

type CapturedMapState = {
  mapWidthPx: number
  mapHeightPx: number
  devicePixelRatio: number
  view: {
    center: [number, number]
    resolution: number
    rotation: number
  }
}

const getCapturedMapState = (emMap: EmMap): CapturedMapState => {
  const map = emMap.olMapInstance
  const view = map?.getView()

  const center = view?.getCenter()
  const resolution = view?.getResolution()
  const rotation = view?.getRotation()

  if (!map || !view || !center || typeof resolution !== 'number' || typeof rotation !== 'number') {
    throw new Error('Could not read map state for export')
  }

  const bounds = (emMap as unknown as HTMLElement).getBoundingClientRect()
  const [x, y] = center

  return {
    mapWidthPx: Math.round(bounds.width),
    mapHeightPx: Math.round(bounds.height),
    devicePixelRatio: window.devicePixelRatio || 1,
    view: {
      center: [x, y],
      resolution,
      rotation,
    },
  }
}

const initialiseProximityAlertForm = () => {
  const form = document.querySelector<HTMLFormElement>('#exportProximityAlertForm')
  if (!form) return

  const capturedMapStateInput = queryElement(form, '#capturedMapState', HTMLInputElement)
  const emMap = queryElement(document, 'em-map') as EmMap

  form.addEventListener('submit', () => {
    try {
      capturedMapStateInput.value = JSON.stringify(getCapturedMapState(emMap))
    } catch {
      capturedMapStateInput.value = ''
    }
  })
}

export default initialiseProximityAlertForm
