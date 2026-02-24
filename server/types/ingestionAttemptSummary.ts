type IngestionAttemptSummary = {
  ingestionAttemptId: string
  ingestionStatus: string
  policeForceArea: string
  batchId: string
  matches?: number
  createdAt: string
}

export default IngestionAttemptSummary
