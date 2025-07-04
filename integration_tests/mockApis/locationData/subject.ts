import { stubFor } from '../wiremock'

const baseUrl = '/crime-matching'

type StubGetSubject200Options = {
  status: 200
  personId: string
  query: string
  response: {
    locations: Array<{
      locationRef: number
      point: { latitude: number; longitude: number }
      confidenceCircle: number
      speed: number
      direction: number
      timestamp: string
      geolocationMechanism: number
    }>
  }
}

type StubGetSubjects404Options = {
  status: 404 | 500
  personId: string
  query: string
  response: string
}

type StubGetSubjectOptions = StubGetSubject200Options | StubGetSubjects404Options

const defaultGetSubjectOptions: StubGetSubjectOptions = {
  status: 200,
  personId: '1',
  query: '',
  response: {
    locations: [],
  },
}

const stubGetSubject = (options: StubGetSubjectOptions = defaultGetSubjectOptions) => {
  let urlPattern = `${baseUrl}/subjects/${options.personId}`

  if (options.query.length > 0) {
    urlPattern += `\\?${options.query}`
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

export { stubGetSubject, StubGetSubjectOptions }
