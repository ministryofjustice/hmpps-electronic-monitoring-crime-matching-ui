import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import presentIngestionAttemptMatches from './ingestionAttemptMatches'
import presentIngestionAttemptStatus from './ingestionAttemptStatus'
import presentPoliceForceArea from './policeForceArea'

const exportableIngestionStatuses = ['SUCCESSFUL', 'PARTIAL']

const canBeExported = ({ ingestionStatus, matches }: IngestionAttemptSummary): boolean => {
  return exportableIngestionStatuses.includes(ingestionStatus) && (matches ?? 0) > 0
}

const presentIngestionAttemptSummary = (ingestionAttempt: IngestionAttemptSummary) => {
  return {
    ...ingestionAttempt,
    ...presentIngestionAttemptStatus(ingestionAttempt.ingestionStatus),
    matchesText: presentIngestionAttemptMatches(ingestionAttempt.ingestionStatus, ingestionAttempt.matches),
    policeForceArea: presentPoliceForceArea(ingestionAttempt.policeForceArea),
    canBeExported: canBeExported(ingestionAttempt),
  }
}

const presentIngestionAttemptSummaries = (ingestionAttempts: Array<IngestionAttemptSummary>) => {
  return ingestionAttempts.map(presentIngestionAttemptSummary)
}

export default presentIngestionAttemptSummaries
