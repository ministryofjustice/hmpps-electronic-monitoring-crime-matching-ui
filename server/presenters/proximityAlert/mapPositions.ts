import CrimeVersion from "../../types/crimeVersion"

export type ProximityAlertMapPosition =
  | {
      positionType: 'wearer'
      latitude: number
      longitude: number
      confidence: number
      timestamp: string
      sequenceLabel: string
      geolocationMechanism: string
      deviceId: number
      personName: string
      personNomisId: string
    }
  | {
      positionType: 'crime'
      latitude: number
      longitude: number
    }

export type MatchingResultFixture = {
  crimeVersion: {
    crimeVersionId: string
    crimeReference: string
    crimeType: string
    fromDateTime: string
    toDateTime: string
    latitude: number
    longitude: number
    crimeText: string
  }
  matchedDeviceWearers: Array<{
    deviceWearerId: string
    name: string
    nomisId: string
    deviceId: number
    positions: Array<{
      positionId: string
      capturedDateTime: string
      sequenceLabel: string
      latitude: number
      longitude: number
      confidenceCircle: number
    }>
  }>
}

export default function toProximityAlertMapPositions(crimeVersion: CrimeVersion): ProximityAlertMapPosition[] {
  const crimePosition: ProximityAlertMapPosition = {
    positionType: 'crime',
    latitude: crimeVersion.latitude,
    longitude: crimeVersion.longitude,
  }

  let wearerPositions: ProximityAlertMapPosition[] = []

  if (crimeVersion.matching) {
    wearerPositions = crimeVersion.matching.deviceWearers.flatMap(wearer =>
      wearer.positions.map(pos => ({
        positionType: 'wearer' as const,
        latitude: pos.latitude,
        longitude: pos.longitude,
        confidence: pos.confidence,
        timestamp: pos.capturedDateTime,
        sequenceLabel: pos.sequenceLabel,
        geolocationMechanism: 'GPS' as const,
        deviceId: wearer.deviceId,
        personName: wearer.name,
        personNomisId: wearer.nomisId,
      })),
    )
  }

  return [crimePosition, ...wearerPositions]
}