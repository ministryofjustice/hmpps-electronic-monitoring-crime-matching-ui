import exportProximityAlertFormSchema, {
  formStringArraySchema,
  optionalTrimmedStringSchema,
} from '../../schemas/proximityAlert/exportProximityAlert'

export type ExportProximityAlertState = {
  error?: string
  selectedDeviceIds: string[]
  selectedTrackDeviceIds: string[]
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
  capturedMapState?: string
}

export type ExportProximityAlertForm = {
  url: string
  selectedDeviceIds: string[]
  selectedTrackDeviceIds: string[]
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
  capturedMapState?: string
}

type ParsedExportProximityAlertData = {
  deviceIds: string[]
  capturedMapState?: string
}

export type ParsedExportProximityAlertRequest =
  | {
      success: true
      exportData: ParsedExportProximityAlertData
      formState: ExportProximityAlertState
    }
  | {
      success: false
      formState: ExportProximityAlertState
    }

// Default values for the form
const defaultExportProximityAlertState = (): ExportProximityAlertState => ({
  selectedDeviceIds: [],
  selectedTrackDeviceIds: [],
  showConfidenceCircles: true,
  showLocationNumbering: true,
  capturedMapState: undefined,
})

const parseDeviceIdsFromDeviceWearerToggle = (value: unknown): string[] =>
  formStringArraySchema
    .parse(value)
    .map(item => item.match(/^device-wearer-(.+)$/)?.[1])
    .filter((deviceId): deviceId is string => Boolean(deviceId))

const parseTrackDeviceIds = (value: unknown): string[] =>
  formStringArraySchema
    .parse(value)
    .map(item => item.match(/^device-wearer-tracks-(.+)$/)?.[1])
    .filter((deviceId): deviceId is string => Boolean(deviceId))

const parseAnalysisToggles = (
  value: unknown,
): {
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
} => {
  const toggles = formStringArraySchema.parse(value)

  return {
    showConfidenceCircles: toggles.includes('device-wearer-circles-'),
    showLocationNumbering: toggles.includes('device-wearer-labels-'),
  }
}

const toExportProximityAlertState = (body: Record<string, unknown>): ExportProximityAlertState => {
  const selectedDeviceIds = parseDeviceIdsFromDeviceWearerToggle(body['device-wearer-toggle'])
  const selectedTrackDeviceIds = parseTrackDeviceIds(body['device-wearer-tracks'])
  const { showConfidenceCircles, showLocationNumbering } = parseAnalysisToggles(body['analysis-toggles'])
  const capturedMapState = optionalTrimmedStringSchema.parse(body.capturedMapState)

  return {
    ...defaultExportProximityAlertState(),
    selectedDeviceIds,
    selectedTrackDeviceIds,
    showConfidenceCircles,
    showLocationNumbering,
    capturedMapState,
  }
}

// Resolve state coming from session/query/etc.
const toResolvedExportProximityAlertState = (
  state?: Partial<ExportProximityAlertState>,
): ExportProximityAlertState => ({
  ...defaultExportProximityAlertState(),
  ...state,
})

export const parseExportProximityAlertRequest = (body: Record<string, unknown>): ParsedExportProximityAlertRequest => {
  const formState = toExportProximityAlertState(body)

  const formData = exportProximityAlertFormSchema.safeParse({
    deviceIds: formState.selectedDeviceIds,
    capturedMapState: formState.capturedMapState,
  })

  if (!formData.success) {
    return {
      success: false,
      formState,
    }
  }

  // If validation passes, return the parsed export data along with the form state for potential reuse in the UI
  return {
    success: true,
    exportData: formData.data,
    formState,
  }
}

export const withExportProximityAlertError = (
  state: ExportProximityAlertState,
  error: string,
): ExportProximityAlertState => ({
  ...state,
  error,
})

// Convert form state to the shape needed for rendering the export form in the UI
export const toExportProximityAlertForm = (
  crimeVersionId: string,
  state?: Partial<ExportProximityAlertState>,
): ExportProximityAlertForm => {
  const resolvedState = toResolvedExportProximityAlertState(state)

  return {
    url: `/proximity-alert/${encodeURIComponent(crimeVersionId)}/export-proximity-alert`,
    selectedDeviceIds: resolvedState.selectedDeviceIds,
    selectedTrackDeviceIds: resolvedState.selectedTrackDeviceIds,
    showConfidenceCircles: resolvedState.showConfidenceCircles,
    showLocationNumbering: resolvedState.showLocationNumbering,
    capturedMapState: resolvedState.capturedMapState,
  }
}
