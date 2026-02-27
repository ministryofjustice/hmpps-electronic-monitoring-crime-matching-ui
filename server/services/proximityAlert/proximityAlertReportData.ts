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
  selectedDeviceWearerId?: string
  selectedDeviceWearerIds?: string[]
}

function normaliseSelectedWearerIds(options: ToProximityAlertReportDataOptions): Set<string> | null {
  if (Array.isArray(options.selectedDeviceWearerIds) && options.selectedDeviceWearerIds.length > 0) {
    return new Set(options.selectedDeviceWearerIds.map(String))
  }

  if (options.selectedDeviceWearerId) {
    return new Set([String(options.selectedDeviceWearerId)])
  }

  return null
}

export function toProximityAlertReportData(
  fixture: MatchingResultFixture,
  options: ToProximityAlertReportDataOptions = {},
): ProximityAlertReportData {
  const selectedWearerIdSet = normaliseSelectedWearerIds(options)

  const matchedDeviceWearers: ProximityAlertReportDeviceWearer[] = fixture.matchedDeviceWearers
    .filter(wearer => {
      const id = String(wearer.deviceWearerId)
      return selectedWearerIdSet ? selectedWearerIdSet.has(id) : true
    })
    .map(wearer => ({
      deviceWearerId: String(wearer.deviceWearerId),
      deviceId: Number(wearer.deviceId),
      name: wearer.name,
      nomisId: wearer.nomisId,
      positions: wearer.positions.map(p => ({
        sequenceLabel: p.sequenceLabel,
        capturedDateTime: p.capturedDateTime,
        latitude: p.latitude,
        longitude: p.longitude,
        confidenceCircle: p.confidenceCircle,
      })),
    }))

  const { crimeVersion } = fixture

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
    matchedDeviceWearers,
  }
}
