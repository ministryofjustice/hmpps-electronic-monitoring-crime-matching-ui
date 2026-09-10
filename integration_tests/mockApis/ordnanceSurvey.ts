import { stubFor } from './wiremock'

const baseUrl = '/os'

const stubOSGetToken = () => {
  return stubFor({
    request: {
      method: 'POST',
      urlPath: `${baseUrl}/oauth2/token/v1`,
    },
    response: {
      status: 200,
      jsonBody: {},
    },
  })
}

const stubOSGetVectorStyle = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPath: `${baseUrl}/vts/resources/styles`,
    },
    response: {
      status: 200,
      jsonBody: {
        version: 8,
        sources: {
          'os-source': { type: 'vector', url: 'http://localhost:9091/os/original-source' },
        },
        layers: [
          { id: 'background', type: 'background', paint: {} },
          { id: 'stub-layer', type: 'fill', source: 'os-source', paint: {} },
        ],
      },
    },
  })
}

const stubOSGetVectorSource = () => {
    return stubFor({
    request: {
      method: 'GET',
      urlPath: `${baseUrl}/original-source`,
    },
    response: {
      status: 200,
      jsonBody: {
      type: 'vector',
      tiles: ['/os-map/vector/tiles/{z}/{x}/{y}.pbf'],
    },
    },
  })
}

const stubOSGetTile = () => {}

export default {
  stubOSGetToken,
  stubOSGetVectorStyle,
  stubOSGetVectorSource
}
