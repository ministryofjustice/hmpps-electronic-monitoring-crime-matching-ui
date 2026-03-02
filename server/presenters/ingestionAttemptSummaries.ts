import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import presentPoliceForceArea from './policeForceArea'

const failedIngestionStatuses = new Set(['FAILED', 'ERROR'])
const statusMap = new Map([
  ['ERROR', 'Failed'],
  ['FAILED', 'Failed ingestion'],
  ['PARTIAL', 'Partially ingested'],
  ['SUCCESSFUL', 'Ingested'],
])

const getMatchesText = ({ ingestionStatus, matches }: IngestionAttemptSummary): string => {
  if (failedIngestionStatuses.has(ingestionStatus)) {
    return 'N/A'
  }

  if (matches === null) {
    return 'In progress'
  }

  return matches.toString()
}

const getStatusText = ({ ingestionStatus }: IngestionAttemptSummary): string => {
  return statusMap.get(ingestionStatus) ?? ''
}

const presentIngestionAttemptSummary = (ingestionAttempt: IngestionAttemptSummary) => {
  return {
    ...ingestionAttempt,
    matchesText: getMatchesText(ingestionAttempt),
    policeForceArea: presentPoliceForceArea(ingestionAttempt.policeForceArea),
    statusText: getStatusText(ingestionAttempt),
  }
}

const presentIngestionAttemptSummaries = (ingestionAttempts: Array<IngestionAttemptSummary>) => {
  return ingestionAttempts.map(presentIngestionAttemptSummary)
}

export default presentIngestionAttemptSummaries
