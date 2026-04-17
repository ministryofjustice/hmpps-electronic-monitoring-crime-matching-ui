import CrimeVersion from '../../types/crimeVersion'
import { formatDateTime } from '../../utils/date'

export type ProximityAlertMapPosition =
  | {
      positionType: 'wearer'
      latitude: number
      longitude: number
      precision: number
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
      crimeReference: string
      crimeTypeId: string
      overlayTitleTemplateId: string
      overlayBodyTemplateId: string
      batchId: string
      crimeDateTimeFrom: string
      crimeDateTimeTo: string
    }

export default function toProximityAlertMapPositions(crimeVersion: CrimeVersion): ProximityAlertMapPosition[] {
  const crimePosition: ProximityAlertMapPosition = {
    positionType: 'crime',
    latitude: crimeVersion.latitude,
    longitude: crimeVersion.longitude,
    crimeReference: crimeVersion.crimeReference,
    crimeTypeId: crimeVersion.crimeTypeId,
    overlayTitleTemplateId: 'overlay-title-crime-location',
    overlayBodyTemplateId: 'overlay-body-crime-location',
    batchId: crimeVersion.batchId,
    crimeDateTimeFrom: formatDateTime(crimeVersion.crimeDateTimeFrom, 'DD/MM/YYYY HH:mm'),
    crimeDateTimeTo: formatDateTime(crimeVersion.crimeDateTimeFrom, 'DD/MM/YYYY HH:mm'),
  }

  let wearerPositions: ProximityAlertMapPosition[] = []

  if (crimeVersion.matching) {
    wearerPositions = crimeVersion.matching.deviceWearers.flatMap(wearer =>
      wearer.positions.map(pos => ({
        positionType: 'wearer' as const,
        latitude: pos.latitude,
        longitude: pos.longitude,
        precision: pos.confidence,
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
