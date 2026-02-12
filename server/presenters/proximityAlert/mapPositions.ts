// Flattened and transformed map position data for the proximity alert map view
export type ProximityAlertMapPosition =
  | {
      positionType: 'wearer'
      positionId: string
      latitude: number
      longitude: number
      precision: number
      timestamp: string
      geolocationMechanism: 'GPS' | 'RF' | 'LBS' | 'WIFI'
      sequenceLabel: string
      deviceWearerId: string
      deviceId: number
      personName: string
      personNomisId: string
    }
  | {
      positionType: 'crime'
      positionId: string
      latitude: number
      longitude: number
      precision: number
      timestamp: string
      geolocationMechanism: 'GPS' | 'RF' | 'LBS' | 'WIFI'
      radiusMeters: number
    }

// Fixture/API-like input shape
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

export default function toProximityAlertMapPositions(fixture: MatchingResultFixture): ProximityAlertMapPosition[] {
  // Transform wearer positions from the fixture into map-ready wearer points
  const wearerPositions: ProximityAlertMapPosition[] = fixture.matchedDeviceWearers.flatMap(wearer =>
    wearer.positions.map(pos => ({
      positionType: 'wearer' as const,
      positionId: pos.positionId,
      latitude: pos.latitude,
      longitude: pos.longitude,

      precision: pos.confidenceCircle,
      timestamp: pos.capturedDateTime,
      geolocationMechanism: 'GPS' as const,

      sequenceLabel: pos.sequenceLabel,
      deviceWearerId: wearer.deviceWearerId,
      deviceId: wearer.deviceId,
      personName: wearer.name,
      personNomisId: wearer.nomisId,
    })),
  )

  // Create the crime “centre” position + radius metadata (used to draw the 100m circle)
  const crimePosition: ProximityAlertMapPosition = {
    positionType: 'crime',
    positionId: 'crime-location',
    latitude: fixture.crimeVersion.latitude,
    longitude: fixture.crimeVersion.longitude,
    precision: 0,
    timestamp: fixture.crimeVersion.fromDateTime,
    geolocationMechanism: 'GPS',
    radiusMeters: 100,
  }

  return [crimePosition, ...wearerPositions]
}
