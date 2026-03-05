import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetCrimeMatchingResults200Options = {
  status: 200
  query: string
  response: {
    data: Array<{
      policeForce: string
      batchId: string
      crimeRef: string
      crimeType: string
      crimeDateTimeFrom: string
      crimeDateTimeTo: string
      crimeLatitude: number
      crimeLongitude: number
      crimeText: string
      deviceId: number
      deviceName: string
      subjectId: string
      subjectName: string
      subjectNomisId: string
      subjectPncRef: string
      subjectAddress: string
      subjectDateOfBirth: string
      subjectManager: string
    }>
  }
}

type StubGetCrimeMatchingResultsErrorOptions = {
  status: 404 | 500
  query: string
  response: string
}

type StubGetCrimeMatchingResultsOptions =
  | StubGetCrimeMatchingResults200Options
  | StubGetCrimeMatchingResultsErrorOptions

const defaultGetCrimeMatchingResultsOptions: StubGetCrimeMatchingResultsOptions = {
  status: 200,
  query: '.*',
  response: {
    data: [],
  },
}

const stubGetCrimeMatchingResults = (
  options: StubGetCrimeMatchingResultsOptions = defaultGetCrimeMatchingResultsOptions,
) => {
  let urlPattern = `${baseUrl}/crime-matching-results`

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

export { stubGetCrimeMatchingResults, StubGetCrimeMatchingResultsOptions }
