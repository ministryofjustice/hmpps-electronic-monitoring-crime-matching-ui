const failedIngestionStatuses = new Set(['FAILED', 'ERROR'])

const presentIngestionAttemptMatches = (ingestionStatus: string, matches: number | null): string => {
  if (failedIngestionStatuses.has(ingestionStatus)) {
    return 'N/A'
  }

  if (matches === null) {
    return 'In progress'
  }

  return matches.toString()
}

export default presentIngestionAttemptMatches
