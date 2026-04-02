import CrimeVersion from '../../types/crimeVersion'

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
