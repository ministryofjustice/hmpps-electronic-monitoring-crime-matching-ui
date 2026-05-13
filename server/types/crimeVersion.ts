type CrimeVersion = {
  crimeVersionId: string
  latestCrimeVersionId: string | null
  crimeReference: string
  policeForceArea: string
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
  address: string
  dateOfBirth: string
  deviceId: number
  name: string
  nomisId: string
  pncRef: string
  positions: Array<DeviceWearerPosition>
}

type Matching = {
  deviceWearers: Array<DeviceWearer>
}

export { CrimeVersion, DeviceWearer, DeviceWearerPosition, Matching }
