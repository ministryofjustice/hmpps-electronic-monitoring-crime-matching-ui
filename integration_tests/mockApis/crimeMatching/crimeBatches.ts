import { stubFor } from '../wiremock'

// Has to match the path of the EM_CRIME_MATCHING_API_URL env variable
const baseUrl = '/crime-matching'

type StubCrimeBatchSearchOptions = {
  query: string
  response: {
    data: Array<{
      policeForce: string
      batch: string
      start: string
      end: string
      time: number
      distance: number
      matches: number
    }>
  }
}

// Default options will return an empty array for any query string e.g. ?term=abc
const defaultOptions: StubCrimeBatchSearchOptions = {
  query: '.*',
  response: {
    data: [],
  },
}

const stubCrimeBatchSearch = (options: StubCrimeBatchSearchOptions = defaultOptions) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/crime-batches${options.query}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

export default stubCrimeBatchSearch

export { StubCrimeBatchSearchOptions }
