import IngestionAttempt from '../types/ingestionAttempt'
import presentIngestionAttemptStatus from './ingestionAttemptStatus'
import presentIngestionAttemptMatches from './ingestionAttemptMatches'
import presentPoliceForceArea from './policeForceArea'
import { withFallback } from './helpers/formatters'

const getCrimeTypeStats = (
  ingestionAttempt: IngestionAttempt,
  crimeType: string,
): { submitted: number; failed: number; successful: number } => {
  return (
    ingestionAttempt.crimesByCrimeType.find(stat => stat.crimeType === crimeType) || {
      failed: 0,
      successful: 0,
      submitted: 0,
    }
  )
}

const getCrimeTypeBreakdown = (ingestionAttempt: IngestionAttempt) => {
  return {
    MISSING: getCrimeTypeStats(ingestionAttempt, 'MISSING'),
    RB: getCrimeTypeStats(ingestionAttempt, 'RB'),
    BIAD: getCrimeTypeStats(ingestionAttempt, 'BIAD'),
    AB: getCrimeTypeStats(ingestionAttempt, 'AB'),
    BOTD: getCrimeTypeStats(ingestionAttempt, 'BOTD'),
    TOMV: getCrimeTypeStats(ingestionAttempt, 'TOMV'),
    TFP: getCrimeTypeStats(ingestionAttempt, 'TFP'),
    TFMV: getCrimeTypeStats(ingestionAttempt, 'TFMV'),
  }
}

const presentIngestionAttempt = (ingestionAttempt: IngestionAttempt) => {
  return {
    ...ingestionAttempt,
    ...presentIngestionAttemptStatus(ingestionAttempt.ingestionStatus),
    policeForceArea: presentPoliceForceArea(ingestionAttempt.policeForceArea),
    matchesText: presentIngestionAttemptMatches(ingestionAttempt.ingestionStatus, ingestionAttempt.matches),
    fileName: withFallback(ingestionAttempt.fileName),
    batchId: withFallback(ingestionAttempt.batchId, 'Failed'),
    crimeTypeBreakdown: getCrimeTypeBreakdown(ingestionAttempt),
  }
}

export default presentIngestionAttempt
