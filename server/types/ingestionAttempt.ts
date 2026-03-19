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
}

export default IngestionAttempt
