import { stubFor } from '../wiremock'

const baseUrl = '/crime-matching'

type StubCreateSubjectLocationsQuery200Options = {
  status: 200
  response: {
    queryExecutionId: string
  }
}

type StubCreateSubjectLocationsQuery400Options = {
  status: 400
  response: Array<{
    field: string
    message: string
  }>
}

type StubCreateSubjectLocationsQuery500Options = {
  status: 500
  response: string
}

type StubCreateSubjectLocationQueryOptions =
  | StubCreateSubjectLocationsQuery200Options
  | StubCreateSubjectLocationsQuery400Options
  | StubCreateSubjectLocationsQuery500Options

// Default options returns a successful response with a mock queryExecutionId
const defaultCreateSubjectLocationQueryOptions: StubCreateSubjectLocationQueryOptions = {
  status: 200,
  response: {
    queryExecutionId: '4321',
  },
}

const stubCreateSubjectLocationsQuery = (
  options: StubCreateSubjectLocationQueryOptions = defaultCreateSubjectLocationQueryOptions,
) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `${baseUrl}/subjects/locations-query`,
    },
    response: {
      status: options.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

export { stubCreateSubjectLocationsQuery, StubCreateSubjectLocationQueryOptions }
