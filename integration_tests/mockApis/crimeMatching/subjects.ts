import { stubFor } from '../wiremock'

// This has to match the path of the EM_CRIME_MATCHING_API_URL env variable
const baseUrl = '/crime-matching'

type StubSubjectSearchOptions = {
  query: string
  response: Array<{
    nomisId: string
    name: string | null
    dateOfBirth: string | null
    address: string | null
    orderStartDate: string | null
    orderEndDate: string | null
    deviceId: string | null
    tagPeriodStartDate: string | null
    tagPeriodEndDate: string | null
  }>
}

// Default options will return an empty array for any query string e.g. ?term=abc
const defaultOptions: StubSubjectSearchOptions = {
  query: '.*',
  response: [],
}

const stubSubjectSearch = (options: StubSubjectSearchOptions = defaultOptions) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/subjects${options.query}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

export default stubSubjectSearch

export { StubSubjectSearchOptions }
