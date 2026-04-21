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
  latitude: number
  longitude: number
  sequenceLabel: string
  confidence: number
  capturedDateTime: string
}

type DeviceWearer = {
  name: string
  deviceId: number
  nomisId: string
  positions: Array<DeviceWearerPosition>
}

type Matching = {
  deviceWearers: Array<DeviceWearer>
}

export { CrimeVersion, DeviceWearer, DeviceWearerPosition, Matching }
