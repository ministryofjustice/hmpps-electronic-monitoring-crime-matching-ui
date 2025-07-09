import { stubFor } from '../wiremock'

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/crime-matching/health/ping`,
    },
    response: {
      status: 200,
    },
  })

export default ping
