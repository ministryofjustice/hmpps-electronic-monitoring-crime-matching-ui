import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetIngestionAttempts200Options = {
  status: 200
  query: string
  response: {
    data: [
      {
        ingestionAttemptId: string
        ingestionStatus: string
        policeForceArea: string
        batchId: string
        matches: number | null
        createdAt: string
      },
    ]
  }
}

type StubGetIngestionAttemptsErrorOptions = {
  status: 404 | 500
  query: string
  response: string
}

type StubGetIngestionAttemptsOptions = StubGetIngestionAttempts200Options | StubGetIngestionAttemptsErrorOptions

const defaultGetIngestionAttemptsOptions: StubGetIngestionAttemptsOptions = {
  status: 200,
  query: '',
  response: {
    data: [
      {
        ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
        ingestionStatus: 'SUCCESSFUL',
        policeForceArea: 'METROPOLITAN',
        batchId: 'MPS20251110',
        matches: 0,
        createdAt: '2025-01-01T11:23:34.000Z',
      },
    ],
  },
}

const stubGetIngestionAttempts = (options: StubGetIngestionAttemptsOptions = defaultGetIngestionAttemptsOptions) => {
  let urlPattern = `${baseUrl}/ingestion-attempts`

  if (options.query.length > 0) {
    urlPattern += `\\?${options.query}`
  }

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

export { stubGetIngestionAttempts, StubGetIngestionAttemptsOptions }
