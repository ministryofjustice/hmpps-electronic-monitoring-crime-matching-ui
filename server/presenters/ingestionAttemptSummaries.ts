import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import presentPoliceForceArea from './policeForceArea'

const presentIngestionAttemptSummary = ({ policeForceArea, ...ingestionAttempt }: IngestionAttemptSummary) => {
  return {
    ...ingestionAttempt,
    policeForceArea: presentPoliceForceArea(policeForceArea),
  }
}

const presentIngestionAttemptSummaries = (ingestionAttempts: Array<IngestionAttemptSummary>) => {
  return ingestionAttempts.map(presentIngestionAttemptSummary)
}

export default presentIngestionAttemptSummaries
