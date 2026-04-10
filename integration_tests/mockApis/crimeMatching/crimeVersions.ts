import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetCrimeVersions200Options = {
  status: 200
  query: string
  response: {
    data: Array<{
      crimeVersionId: string
      crimeReference: string
      policeForceArea: string
      crimeType: string
      crimeDate: string
      batchId: string
      ingestionDateTime: string
      matched: boolean
      versionLabel: string
      updates: string
    }>
    pageCount: number
    pageNumber: number
    pageSize: number
  }
}

type StubGetCrimeVersionsErrorOptions = {
  status: 404 | 500
  query: string
  response: string
}

type StubGetCrimeVersionsOptions = StubGetCrimeVersions200Options | StubGetCrimeVersionsErrorOptions

const defaultGetCrimeVersionsResultsOptions: StubGetCrimeVersionsOptions = {
  status: 200,
  query: '.*',
  response: {
    data: [],
    pageCount: 1,
    pageNumber: 0,
    pageSize: 10,
  },
}

const stubGetCrimeVersions = (options: StubGetCrimeVersionsOptions = defaultGetCrimeVersionsResultsOptions) => {
  let urlPattern = `${baseUrl}/crime-versions`

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

export { stubGetCrimeVersions, StubGetCrimeVersionsOptions }
