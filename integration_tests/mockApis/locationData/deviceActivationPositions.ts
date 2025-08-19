import { stubFor } from '../wiremock'

const baseUrl = '/crime-matching'

type StubGetDeviceActivationPositions200Options = {
  status: 200
  deviceActivationId: string
  query: string
  response: {
    data: Array<{
      locationRef: number
      point: {
        latitude: number
        longitude: number
      }
      confidenceCircle: number
      speed: number
      direction: number
      timestamp: string
      geolocationMechanism: number
      sequenceNumber: number
    }>
  }
}

type StubGetDeviceActivationPositions404Options = {
  status: 404 | 500
  deviceActivationId: string
  query: string
  response: string
}

type StubGetDeviceActivationPositionsOptions =
  | StubGetDeviceActivationPositions200Options
  | StubGetDeviceActivationPositions404Options

const defaultGetDeviceActivationPositionsOptions: StubGetDeviceActivationPositionsOptions = {
  status: 200,
  deviceActivationId: '1',
  query: '',
  response: {
    data: [],
  },
}

const stubGetDeviceActivationPositions = (
  options: StubGetDeviceActivationPositionsOptions = defaultGetDeviceActivationPositionsOptions,
) => {
  let urlPattern = `${baseUrl}/device-activations/${options.deviceActivationId}/positions`

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

export { stubGetDeviceActivationPositions, StubGetDeviceActivationPositionsOptions }
