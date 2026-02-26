type IngestionAttemptSummary = {
  ingestionAttemptId: string
  ingestionStatus: string
  policeForceArea: string
  batchId: string
  matches: number | null
  createdAt: string
}

export default IngestionAttemptSummary
