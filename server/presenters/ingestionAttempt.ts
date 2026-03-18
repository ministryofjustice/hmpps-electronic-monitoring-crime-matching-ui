import IngestionAttempt from '../types/ingestionAttempt'
import presentIngestionAttemptStatus from './ingestionAttemptStatus'
import presentIngestionAttemptMatches from './ingestionAttemptMatches'
import presentPoliceForceArea from './policeForceArea'
import { withFallback } from './helpers/formatters'

const presentIngestionAttempt = (ingestionAttempt: IngestionAttempt) => {
  return {
    ...ingestionAttempt,
    ...presentIngestionAttemptStatus(ingestionAttempt.ingestionStatus),
    policeForceArea: presentPoliceForceArea(ingestionAttempt.policeForceArea),
    matchesText: presentIngestionAttemptMatches(ingestionAttempt.ingestionStatus, ingestionAttempt.matches),
    fileName: withFallback(ingestionAttempt.fileName),
    batchId: withFallback(ingestionAttempt.batchId, 'Failed'),
  }
}

export default presentIngestionAttempt
