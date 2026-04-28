import initialiseProximityAlertForm from '../../forms/proximity-alert'
import { queryElementAll } from '../../utils/utils'
import type { CapturedMapState } from './crimeVersion'

type InitialiseProximityAlertUserViewArgs = {
  applyCapturedMapState: (state: CapturedMapState) => void
}

const dispatchCheckboxChange = (checkbox: HTMLInputElement) => {
  checkbox.dispatchEvent(new Event('change', { bubbles: true }))
}

const applyCheckboxLayerState = () => {
  const selectors = [
    'input[type="checkbox"][name="device-wearer-toggle"]',
    'input[type="checkbox"][name="device-wearer-tracks"]',
    'input[type="checkbox"][name="analysis-toggles"]',
  ]

  for (const selector of selectors) {
    const checkboxes = queryElementAll(document, selector, HTMLInputElement)

    checkboxes.forEach(checkbox => {
      dispatchCheckboxChange(checkbox)
    })
  }
}

// Type guard to validate the structure of the captured map state
const isValidCapturedMapState = (parsedMapState: unknown): parsedMapState is CapturedMapState => {
  if (!parsedMapState || typeof parsedMapState !== 'object') return false

  const parsedState = parsedMapState as {
    mapWidthPx?: unknown
    mapHeightPx?: unknown
    devicePixelRatio?: unknown
    view?: {
      center?: unknown
      resolution?: unknown
      rotation?: unknown
    }
  }

  return (
    typeof parsedState.mapWidthPx === 'number' &&
    typeof parsedState.mapHeightPx === 'number' &&
    typeof parsedState.devicePixelRatio === 'number' &&
    !!parsedState.view &&
    Array.isArray(parsedState.view.center) &&
    parsedState.view.center.length === 2 &&
    typeof parsedState.view.center[0] === 'number' &&
    typeof parsedState.view.center[1] === 'number' &&
    typeof parsedState.view.resolution === 'number' &&
    typeof parsedState.view.rotation === 'number'
  )
}

// Attempt to read captured map state from hidden input field
const getCapturedMapState = (): CapturedMapState | undefined => {
  const mapStateInput = document.querySelector<HTMLInputElement>('#capturedMapState')
  if (!mapStateInput) return undefined

  const mapStateValue = mapStateInput.value.trim()
  if (!mapStateValue) return undefined

  try {
    const parsedMapState: unknown = JSON.parse(mapStateValue)
    return isValidCapturedMapState(parsedMapState) ? parsedMapState : undefined
  } catch {
    return undefined
  }
}

const initialiseProximityAlertUserView = ({ applyCapturedMapState }: InitialiseProximityAlertUserViewArgs) => {
  applyCheckboxLayerState()

  const capturedMapState = getCapturedMapState()
  if (capturedMapState) {
    applyCapturedMapState(capturedMapState)
  }

  initialiseProximityAlertForm()
}

export default initialiseProximityAlertUserView
