import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import presentPoliceForceArea from './policeForceArea'

const failedIngestionStatuses = new Set(['FAILED', 'ERROR'])

const getMatchesText = ({ ingestionStatus, matches }: IngestionAttemptSummary): string => {
  if (failedIngestionStatuses.has(ingestionStatus)) {
    return 'N/A'
  }

  if (matches === null) {
    return 'In progress'
  }

  return matches.toString()
}

const presentIngestionAttemptSummary = (ingestionAttempt: IngestionAttemptSummary) => {
  return {
    ...ingestionAttempt,
    matchesText: getMatchesText(ingestionAttempt),
    policeForceArea: presentPoliceForceArea(ingestionAttempt.policeForceArea),
  }
}

const presentIngestionAttemptSummaries = (ingestionAttempts: Array<IngestionAttemptSummary>) => {
  return ingestionAttempts.map(presentIngestionAttemptSummary)
}

export default presentIngestionAttemptSummaries
