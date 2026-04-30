import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetHubManagers200Options = {
  status: 200
  response: {
    data: Array<{
      id: string
      name: string
      hasSignature: boolean
    }>
  }
}

type StubGetHubManagersErrorOptions = {
  status: 404 | 500
  response: string
}

type StubGetHubManagersOptions = StubGetHubManagers200Options | StubGetHubManagersErrorOptions

const defaultGetHubManagersOptions: StubGetHubManagersOptions = {
  status: 200,
  response: {
    data: [],
  },
}

const stubGetHubManagers = (options: StubGetHubManagersOptions = defaultGetHubManagersOptions) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/hub-managers`,
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

type StubCreateHubManager200Options = {
  status: 201
  response: {
    data: {
      id: string
      name: string
      hasSignature: boolean
    }
  }
}

type StubCreateHubManagerErrorOptions = {
  status: 404 | 500
  response: string
}

type StubCreateHubManagerOptions = StubCreateHubManager200Options | StubCreateHubManagerErrorOptions

const stubCreateHubManager = (options: StubCreateHubManagerOptions) => {
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: `${baseUrl}/hub-managers`,
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

type StubDeleteHubManager204Options = {
  id: string
  status: 204
}

type StubDeleteHubManagerErrorOptions = {
  id: string
  status: 404 | 500
  response: string
}

type StubDeleteHubManagerOptions = StubDeleteHubManager204Options | StubDeleteHubManagerErrorOptions

const stubDeleteHubManager = (options: StubDeleteHubManagerOptions) => {
  return stubFor({
    request: {
      method: 'DELETE',
      urlPattern: `${baseUrl}/hub-managers/${options.id}`,
    },
    response: {
      status: options.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.status === 204 ? undefined : options.response,
    },
  })
}

type StubUpdateHubManagerSignature200Options = {
  id: string
  status: 200
  response: {
    data: {
      id: string
      name: string
      hasSignature: boolean
    }
  }
}

type StubUpdateHubManagerSignatureErrorOptions = {
  id: string
  status: 404 | 500
  response: string
}

type StubUpdateHubManagerSignaturesOptions =
  | StubUpdateHubManagerSignature200Options
  | StubUpdateHubManagerSignatureErrorOptions

const stubUpdateHubManagerSignature = (options: StubUpdateHubManagerSignaturesOptions) => {
  return stubFor({
    request: {
      method: 'PUT',
      urlPattern: `${baseUrl}/hub-managers/${options.id}/signature`,
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

export {
  stubCreateHubManager,
  StubCreateHubManagerOptions,
  stubDeleteHubManager,
  StubDeleteHubManagerOptions,
  stubGetHubManagers,
  StubGetHubManagersOptions,
  stubUpdateHubManagerSignature,
  StubUpdateHubManagerSignaturesOptions,
}
