const statusMap = new Map([
  ['ERROR', 'Error'],
  ['FAILED', 'Failed ingestion'],
  ['PARTIAL', 'Partially ingested'],
  ['SUCCESSFUL', 'Ingested'],
])

const statusColourMap = new Map([
  ['ERROR', 'red'],
  ['FAILED', 'orange'],
  ['PARTIAL', 'yellow'],
  ['SUCCESSFUL', 'green'],
])

const getStatusText = (ingestionStatus: string): string => {
  return statusMap.get(ingestionStatus) ?? ''
}

const getStatusColour = (ingestionStatus: string): string => {
  return statusColourMap.get(ingestionStatus) ?? ''
}

const presentIngestionAttemptStatus = (
  ingestionStatus: string,
): { ingestionStatusColour: string; ingestionStatusText: string } => {
  return {
    ingestionStatusColour: getStatusColour(ingestionStatus),
    ingestionStatusText: getStatusText(ingestionStatus),
  }
}

export default presentIngestionAttemptStatus
