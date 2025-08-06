import { stubFor } from './wiremock'

type StubMapToken200Options = {
  status: 200
  token?: string
}

type StubMapTokenErrorOptions = {
  status: 401 | 403 | 500
  response?: string
}

type StubMapTokenOptions = StubMapToken200Options | StubMapTokenErrorOptions

const defaultOptions: StubMapTokenOptions = {
  status: 200,
  token: 'fake-token-for-testing',
}

const stubMapToken = (options: StubMapTokenOptions = defaultOptions) => {
  return stubFor({
    request: {
      method: 'POST',
      urlPath: '/map/token',
    },
    response: {
      status: options.status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody:
        options.status === 200
          ? {
              access_token: options.token || 'fake-token-for-testing',
              expires_in: '3600',
              issued_at: new Date().toISOString(),
              token_type: 'Bearer',
            }
          : undefined,
      body: options.status !== 200 && options.response ? JSON.stringify(options.response) : undefined,
    },
  })
}

const stubMapTiles = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/map-tiles/Road_3857/.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
      base64Body: '',
    },
  })

const stubMapVectorStyle = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/maps/vector/v1/vts.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        version: 8,
        name: 'Stub Vector Style',
        sources: {
          ordnance: {
            type: 'vector',
            url: 'http://localhost:9091/map-tiles/resources/tilejson.json',
          },
        },
        layers: [
          {
            id: 'dummy-layer',
            type: 'background',
            paint: {
              'background-color': '#ffffff',
            },
          },
        ],
      },
    },
  })

const stubVectorTiles = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/map-tiles/.*\\.pbf',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/x-protobuf',
      },
      base64Body: '',
    },
  })

export { stubMapToken, stubMapTiles, stubMapVectorStyle, stubVectorTiles, StubMapTokenOptions }

// Default export for task registration in cypress.config.ts
export default {
  stubMapToken,
  stubMapTiles,
  stubMapVectorStyle,
  stubVectorTiles,
}
