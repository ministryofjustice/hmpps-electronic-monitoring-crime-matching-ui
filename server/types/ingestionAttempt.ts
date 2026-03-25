type IngestionAttempt = {
  ingestionAttemptId: string
  ingestionStatus: string
  policeForceArea: string
  batchId: string
  matches: number | null
  createdAt: string
  fileName: string | null
  submitted: number
  successful: number
  failed: number
  crimesByCrimeType: Array<{ crimeType: string; submitted: number; failed: number; successful: number }>
  validationErrors: Array<{
    crimeReference: string
    errorType: string
    requiredAction: string
  }>
}

export default IngestionAttempt
