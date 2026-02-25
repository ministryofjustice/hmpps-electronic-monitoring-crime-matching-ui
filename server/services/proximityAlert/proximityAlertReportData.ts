// server/services/proximityAlert/proximityAlertReportData.ts

import type { MatchingResultFixture } from '../../presenters/proximityAlert/mapPositions'

export type ProximityAlertReportPositionRow = {
  sequenceLabel: string
  capturedDateTime: string
  latitude: number
  longitude: number
  confidenceCircle: number
}

export type ProximityAlertReportDeviceWearer = {
  deviceWearerId: string
  deviceId: number
  name: string
  nomisId: string
  positions: ProximityAlertReportPositionRow[]
}

export type ProximityAlertReportCrimeVersion = {
  crimeVersionId: string
  crimeReference: string
  crimeType: string
  fromDateTime: string
  toDateTime: string
  latitude: number
  longitude: number
  crimeText: string
}

export type ProximityAlertReportData = {
  generatedAtIso: string
  crimeVersion: ProximityAlertReportCrimeVersion
  matchedDeviceWearers: ProximityAlertReportDeviceWearer[]
}

export type ToProximityAlertReportDataOptions = {
  /**
   * If supplied, only include this device wearer in the report.
   * (Legacy: kept for existing spike usage.)
   */
  selectedDeviceWearerId?: string

  /**
   * If supplied, only include these device wearers in the report.
   * This supports checkbox multi-select.
   */
  selectedDeviceWearerIds?: string[]
}

export function toProximityAlertReportData(
  fixture: MatchingResultFixture,
  options: ToProximityAlertReportDataOptions = {},
): ProximityAlertReportData {
  const { crimeVersion } = fixture

  const selectedIds =
    Array.isArray(options.selectedDeviceWearerIds) && options.selectedDeviceWearerIds.length > 0
      ? options.selectedDeviceWearerIds.map(String)
      : undefined

  const selectedId = options.selectedDeviceWearerId ? String(options.selectedDeviceWearerId) : undefined

  const shouldInclude = (deviceWearerId: unknown): boolean => {
    const id = String(deviceWearerId)
    if (selectedIds) return selectedIds.includes(id)
    if (selectedId) return id === selectedId
    return true
  }

  const deviceWearers = fixture.matchedDeviceWearers
    .filter(w => shouldInclude(w.deviceWearerId))
    .map(w => ({
      deviceWearerId: String(w.deviceWearerId),
      deviceId: Number(w.deviceId),
      name: w.name,
      nomisId: w.nomisId,
      positions: w.positions.map(p => ({
        sequenceLabel: p.sequenceLabel,
        capturedDateTime: p.capturedDateTime,
        latitude: p.latitude,
        longitude: p.longitude,
        confidenceCircle: p.confidenceCircle,
      })),
    }))

  return {
    generatedAtIso: new Date().toISOString(),
    crimeVersion: {
      crimeVersionId: crimeVersion.crimeVersionId,
      crimeReference: crimeVersion.crimeReference,
      crimeType: crimeVersion.crimeType,
      fromDateTime: crimeVersion.fromDateTime,
      toDateTime: crimeVersion.toDateTime,
      latitude: crimeVersion.latitude,
      longitude: crimeVersion.longitude,
      crimeText: crimeVersion.crimeText,
    },
    matchedDeviceWearers: deviceWearers,
  }
}
