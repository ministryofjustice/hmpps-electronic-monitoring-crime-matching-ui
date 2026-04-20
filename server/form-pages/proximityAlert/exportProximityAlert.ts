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
    selectedDeviceIds,
    selectedTrackDeviceIds,
    showConfidenceCircles,
    showLocationNumbering,
    capturedMapState,
  }
}

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

export const toExportProximityAlertForm = (
  crimeVersionId: string,
  state?: ExportProximityAlertState,
): {
  url: string
  selectedDeviceIds?: string[]
  selectedTrackDeviceIds?: string[]
  showConfidenceCircles?: boolean
  showLocationNumbering?: boolean
  capturedMapState?: string
} => ({
  url: `/proximity-alert/${encodeURIComponent(crimeVersionId)}/export-proximity-alert`,
  selectedDeviceIds: state?.selectedDeviceIds,
  selectedTrackDeviceIds: state?.selectedTrackDeviceIds,
  showConfidenceCircles: state?.showConfidenceCircles,
  showLocationNumbering: state?.showLocationNumbering,
  capturedMapState: state?.capturedMapState,
})
