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

type Matching = {
  deviceWearers: Array<{
    name: string
    deviceId: number
    nomisId: string
    positions: Array<{
      latitude: number
      longitude: number
      sequenceLabel: string
      confidence: number
      capturedDateTime: string
    }>
  }>
}

export default CrimeVersion
