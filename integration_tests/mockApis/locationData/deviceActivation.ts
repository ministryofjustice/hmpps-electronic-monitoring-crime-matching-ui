import { stubFor } from '../wiremock'

const baseUrl = '/crime-matching'

type StubGetDeviceActivation200Options = {
  status: 200
  deviceActivationId: string
  response: {
    data: {
      deviceActivationId: number
      deviceId: number
      personId: number
      deviceActivationDate: string
      deviceDeactivationDate: string | null
    }
  }
}

type StubGetDeviceActivation404Options = {
  status: 404 | 500
  deviceActivationId: string
  response: string
}

type StubGetDeviceActivationOptions = StubGetDeviceActivation200Options | StubGetDeviceActivation404Options

const defaultGetDeviceActivationOptions: StubGetDeviceActivationOptions = {
  status: 200,
  deviceActivationId: '1',
  response: {
    data: {
      deviceActivationId: 1,
      deviceId: 123456789,
      personId: 123456789,
      deviceActivationDate: '2025-01-01T00:00:00.000Z',
      deviceDeactivationDate: null,
    },
  },
}

const stubGetDeviceActivation = (options: StubGetDeviceActivationOptions = defaultGetDeviceActivationOptions) => {
  const urlPattern = `${baseUrl}/device-activations/${options.deviceActivationId}`

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

export { stubGetDeviceActivation, StubGetDeviceActivationOptions }
