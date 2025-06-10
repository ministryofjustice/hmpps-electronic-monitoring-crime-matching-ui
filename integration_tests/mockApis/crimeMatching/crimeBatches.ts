import { stubFor } from '../wiremock'

// Has to match the path of the EM_CRIME_MATCHING_API_URL env variable
const baseUrl = '/crime-matching'

type StubCreateCrimeBatchesQuery200Options = {
  status: 200
  response: {
    queryExecutionId: string
  }
}

type StubCreateCrimeBatchesQuery400Options = {
  status: 400
  response: Array<{
    field: string
    message: string
  }>
}

type StubCreateCrimeBatchesQuery500Options = {
  status: 500
  response: string
}

type StubCreateCrimeBatchQueryOptions =
  | StubCreateCrimeBatchesQuery200Options
  | StubCreateCrimeBatchesQuery400Options
  | StubCreateCrimeBatchesQuery500Options

// Default options returns a successful response with a mock queryExecutionId
const defaultCreateCrimeBatchOptions: StubCreateCrimeBatchQueryOptions = {
  status: 200,
  response: {
    queryExecutionId: '1234',
  },
}

const stubCreateCrimeBatchesQuery = (options: StubCreateCrimeBatchQueryOptions = defaultCreateCrimeBatchOptions) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `${baseUrl}/crime-batches-query`,
    },
    response: {
      status: options.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

type StubGetCrimeBatches200Options = {
  status: 200
  query: string
  response: Array<{
    policeForce: string
    batch: string
    start: string
    end: string
    time: number
    distance: number
    matches: number
  }>
}

type StubGetCrimeBatches404Options = {
  status: 404
  query: string
  response: string
}

type StubGetCrimeBatchesOptions = StubGetCrimeBatches200Options | StubGetCrimeBatches404Options

// Default options will return an empty array for any query string e.g. ?term=abc
const defaultGetCrimeBatchOptions: StubGetCrimeBatchesOptions = {
  status: 200,
  query: '.*',
  response: [],
}

const stubGetCrimeBatchesQuery = (options: StubGetCrimeBatchesOptions = defaultGetCrimeBatchOptions) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/crime-batches-query${options.query}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

export {
  stubCreateCrimeBatchesQuery,
  stubGetCrimeBatchesQuery,
  StubCreateCrimeBatchQueryOptions,
  StubGetCrimeBatchesOptions,
}
