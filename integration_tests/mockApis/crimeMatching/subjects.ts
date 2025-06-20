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
  | StubCreateSubjectsQuery400Options
  | StubCreateSubjectsQuery500Options

// Default options returns a successful response with a mock queryExecutionId
const defaultCreateSubjectQueryOptions: StubCreateSubjectQueryOptions = {
  status: 200,
  response: {
    queryExecutionId: '1234',
  },
}

const stubCreateSubjectsQuery = (options: StubCreateSubjectQueryOptions = defaultCreateSubjectQueryOptions) =>
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

type StubGetSubjectsQuery200Options = {
  status: 200
  query: string
  response: {
    data: Array<{
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
    pageCount: number
    pageNumber: number
    pageSize: number
  }
}

type StubGetSubjectsQuery404Options = {
  status: 404 | 500
  query: string
  response: string
}

type StubGetSubjectsQueryOptions = StubGetSubjectsQuery200Options | StubGetSubjectsQuery404Options

const defaultGetSubjectQueryOptions: StubGetSubjectsQueryOptions = {
  status: 200,
  query: '.*',
  response: {
    data: [],
    pageCount: 1,
    pageNumber: 1,
    pageSize: 10,
  },
}

const stubGetSubjectsQuery = (options: StubGetSubjectsQueryOptions = defaultGetSubjectQueryOptions) =>
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

export { stubCreateSubjectsQuery, stubGetSubjectsQuery, StubCreateSubjectQueryOptions, StubGetSubjectsQueryOptions }
