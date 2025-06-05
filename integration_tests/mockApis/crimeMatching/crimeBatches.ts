import { stubFor } from '../wiremock'

type StubCrimeBatchSearchOptions = {
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

const stubCrimeBatchSearch = (options: StubCrimeBatchSearchOptions) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/crime-matching/crime-batches.*`,
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
