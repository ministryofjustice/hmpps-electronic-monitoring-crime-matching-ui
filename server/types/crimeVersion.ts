type CrimeVersion = {
  crimeVersionId: string
  crimeReference: string
  batchId: string
  crimeTypeDescription: string
  crimeTypeId: string
  crimeDateTimeFrom: string
  crimeDateTimeTo: string
  crimeText: string
  latitude: number
  longitude: number
  versionLabel: string
  matching: Matching | null
}

type DeviceWearerPosition = {
  capturedDateTime: string
  direction: number
  latitude: number
  longitude: number
  precision: number
  sequenceLabel: string
  speed: number
}

type DeviceWearer = {
  deviceId: number
  name: string
  nomisId: string
  positions: Array<DeviceWearerPosition>
}

type Matching = {
  deviceWearers: Array<DeviceWearer>
}

export { CrimeVersion, DeviceWearer, DeviceWearerPosition, Matching }
