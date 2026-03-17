import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetIngestionAttempts200Options = {
  status: 200
  query: string
  response: {
    data: Array<{
      ingestionAttemptId: string
      ingestionStatus: string
      policeForceArea: string
      crimeBatchId: string
      batchId: string
      matches: number | null
      createdAt: string
    }>
    pageCount: number
    pageNumber: number
    pageSize: number
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
    data: [],
    pageCount: 1,
    pageNumber: 1,
    pageSize: 30,
  },
}

const stubGetIngestionAttempts = (options: StubGetIngestionAttemptsOptions = defaultGetIngestionAttemptsOptions) => {
  let urlPattern = `${baseUrl}/ingestion-attempts`

  if (options.query.length > 0) {
    urlPattern += `\\?${options.query.split(':').join('%3A')}`
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
