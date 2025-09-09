import { stubFor } from '../wiremock'

const baseUrl = '/crime-matching'

type StubGetPersons200Options = {
  status: 200
  query: string
  response: {
    data: Array<{
      personId: string
      nomisId: string
      name: string
      pncRef: string
      dateOfBirth: string
      address: string
      probationPractitioner: string
      deviceActivations: Array<{
        deviceActivationId: number
        deviceId: number
        deviceName: string
        personId: number
        deviceActivationDate: string
        deviceDeactivationDate: string | null
        orderStart: string
        orderEnd: string
      }>
    }>
    pageCount: number
    pageNumber: number
    pageSize: number
  }
}

type StubGetPersons404Options = {
  status: 404 | 500
  query: string
  response: string
}

type StubGetPersonsOptions = StubGetPersons200Options | StubGetPersons404Options

const defaultGetPersonsQueryOptions: StubGetPersonsOptions = {
  status: 200,
  query: '.*',
  response: {
    data: [],
    pageCount: 1,
    pageNumber: 1,
    pageSize: 10,
  },
}

const stubGetPersons = (options: StubGetPersonsOptions = defaultGetPersonsQueryOptions) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/persons${options.query}`,
    },
    response: {
      status: options.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response,
    },
  })

export { stubGetPersons, StubGetPersonsOptions }
