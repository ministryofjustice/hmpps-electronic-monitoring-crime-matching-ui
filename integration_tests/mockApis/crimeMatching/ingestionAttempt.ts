import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetIngestionAttempt200Options = {
  status: 200
  ingestionAttemptId
  response: {
    data: {
      ingestionAttemptId: string
      ingestionStatus: string
      policeForceArea: string
      batchId: string
      matches: number | null
      createdAt: string
      fileName: string | null
      submitted: number
      successful: number
      failed: number
      crimesByCrimeType: Array<{
        crimeType: string
        submitted: number
        successful: number
        failed: number
      }>
    }
  }
}

type StubGetIngestionAttemptErrorOptions = {
  status: 404 | 500
  ingestionAttemptId
  response: string
}

type StubGetIngestionAttemptOptions = StubGetIngestionAttempt200Options | StubGetIngestionAttemptErrorOptions

const stubGetIngestionAttempt = (options: StubGetIngestionAttemptOptions) => {
  const urlPattern = `${baseUrl}/ingestion-attempts/${options.ingestionAttemptId}`

  return stubFor({
    request: {
      method: 'GET',
      urlPattern,
    },
    response: {
      status: options.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })
}

export { stubGetIngestionAttempt, StubGetIngestionAttemptOptions }
