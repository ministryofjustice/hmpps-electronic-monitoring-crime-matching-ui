import { stubFor } from '../wiremock'

const baseUrl = '/crime-matching'

type StubCreateSubjectsQuery200Options = {
  status: 200
  response: {
    queryExecutionId: string
  }
}

type StubCreateSubjectsQuery400Options = {
  status: 400
  response: Array<{
    field: string
    message: string
  }>
}

type StubCreateSubjectsQuery500Options = {
  status: 500
  response: string
}

type StubCreateSubjectQueryOptions =
  | StubCreateSubjectsQuery200Options
  | StubSubjectsQuery400Options
  | StubCreateSubjectsQuery500Options

// Default options returns a successful response with a mock queryExecutionId
const defaultCreateSubjectOptions: StubCreateSubjectQueryOptions = {
  status: 200,
  response: {
    queryExecutionId: '1234',
  },
}

const stubCreateSubjectsQuery = (options: StubCreateSubjectQueryOptions = defaultCreateSubjectOptions) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `${baseUrl}/subjects-query`,
    },
    response: {
      status: options.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

type StubGetSubjects200Options = {
  status: 200
  query: string
  response: Array<{
    nomisId: string
    name: string
    dateOfBirth: string
    address: string
    orderStartDate: string
    orderEndDate: string
    deviceId: string
    tagPeriodStartDate: string
    tagPeriodEndDate: string
  }>
}

type StubGetSubjects404Options = {
  status: 404 | 500
  query: string
  response: string
}

type StubGetSubjectsOptions = StubGetSubjects200Options | StubGetSubjects404Options

const defaultGetSubjectOptions: StubGetSubjectsOptions = {
  status: 200,
  query: '.*',
  response: [],
}

const stubGetSubjectsQuery = (options: StubGetSubjectsOptions = defaultGetSubjectOptions) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/subjects-query${options.query}`,
    },
    response: {
      status: options.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

export { stubCreateSubjectsQuery, stubGetSubjectsQuery, StubCreateSubjectQueryOptions, StubGetSubjectsOptions }
