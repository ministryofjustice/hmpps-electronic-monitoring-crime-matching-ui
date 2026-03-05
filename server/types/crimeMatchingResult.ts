type CrimeMatchingResult = {
  policeForce: string
  batchId: string
  crimeRef: string
  crimeType: string
  crimeDateTimeFrom: string
  crimeDateTimeTo: string
  crimeLatitude: number
  crimeLongitude: number
  crimeText: string
  deviceId: number
  deviceName: string
  subjectId: string
  subjectName: string
  subjectNomisId: string
  subjectPncRef: string
  subjectAddress: string
  subjectDateOfBirth: string
  subjectManager: string
}

export default CrimeMatchingResult
