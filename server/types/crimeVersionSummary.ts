type CrimeVersionSummary = {
  crimeVersionId: string
  crimeReference: string
  policeForceArea: string
  crimeType: string
  crimeDate: string
  batchId: string
  ingestionDateTime: string
  matched: boolean
  versionLabel: string
  updates: string
}

export default CrimeVersionSummary
