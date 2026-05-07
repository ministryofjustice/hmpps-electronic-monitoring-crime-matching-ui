import type { CrimeVersion } from '../types/crimeVersion'

export type ProximityAlertReportPositionRow = {
  sequenceLabel: string
  capturedDateTime: string
  latitude: number
  longitude: number
  confidenceCircle: number
  speed: number
  direction: number
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
  batchId: string
  crimeType: string
  fromDateTime: string
  toDateTime: string
  latitude: number
  longitude: number
  crimeText: string
}

export type ProximityAlertReportData = {
  reportGeneratedAt: string
  crimeVersionData: ProximityAlertReportCrimeVersion
  matchedDeviceWearers: ProximityAlertReportDeviceWearer[]
}

export type PresentProximityAlertReportDataOptions = {
  selectedDeviceIds?: string[]
}

const normaliseSelectedDeviceIds = (selectedDeviceIds?: string[]): Set<string> | null => {
  if (Array.isArray(selectedDeviceIds) && selectedDeviceIds.length > 0) {
    return new Set(selectedDeviceIds.map(String))
  }

  return null
}

const presentProximityAlertReportData = (
  crimeVersion: CrimeVersion,
  options: PresentProximityAlertReportDataOptions = {},
): ProximityAlertReportData => {
  const selectedDeviceIdSet = normaliseSelectedDeviceIds(options.selectedDeviceIds)

  const matchedDeviceWearers: ProximityAlertReportDeviceWearer[] =
    crimeVersion.matching?.deviceWearers
      .filter(deviceWearer => {
        const deviceId = String(deviceWearer.deviceId)
        return selectedDeviceIdSet ? selectedDeviceIdSet.has(deviceId) : true
      })
      .map(deviceWearer => ({
        deviceWearerId: String(deviceWearer.deviceId),
        deviceId: Number(deviceWearer.deviceId),
        name: deviceWearer.name,
        nomisId: deviceWearer.nomisId,
        positions: deviceWearer.positions.map(position => ({
          sequenceLabel: position.sequenceLabel,
          capturedDateTime: position.capturedDateTime,
          latitude: position.latitude,
          longitude: position.longitude,
          confidenceCircle: position.precision,
          speed: position.speed,
          direction: position.direction,
        })),
      })) ?? []

  return {
    reportGeneratedAt: new Date().toISOString(),
    crimeVersionData: {
      crimeVersionId: crimeVersion.crimeVersionId,
      crimeReference: crimeVersion.crimeReference,
      batchId: crimeVersion.batchId,
      crimeType: crimeVersion.crimeTypeDescription,
      fromDateTime: crimeVersion.crimeDateTimeFrom,
      toDateTime: crimeVersion.crimeDateTimeTo,
      latitude: crimeVersion.latitude,
      longitude: crimeVersion.longitude,
      crimeText: crimeVersion.crimeText,
    },
    matchedDeviceWearers,
  }
}

export default presentProximityAlertReportData
