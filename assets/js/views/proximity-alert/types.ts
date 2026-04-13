export type WearerPosition = {
  positionType: 'wearer'
  latitude: number
  longitude: number
  precision: number
  timestamp: string
  sequenceLabel: string
  deviceId: number
}

export type CrimePosition = {
  positionType: 'crime'
  latitude: number
  longitude: number
  radiusMeters: number
  crimeTypeId: string
}
