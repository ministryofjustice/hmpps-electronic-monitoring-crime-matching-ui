type IngestionAttemptSummary = {
  ingestionAttemptId: string
  ingestionStatus: string
  policeForceArea: string
  crimeBatchId: string
  batchId: string
  matches: number | null
  createdAt: string
}

export default IngestionAttemptSummary
