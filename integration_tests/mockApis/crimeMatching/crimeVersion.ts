import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetCrimeVersion200Options = {
  status: 200
  crimeVersionId
  response: {
    data: {
      crimeVersionId: string
      crimeReference: string
      crimeType: string
      crimeTypeId: string
      crimeDateTimeFrom: string
      crimeDateTimeTo: string
      crimeText: string
      longitude: number
      latitude: number
      versionLabel: string
      matching: {
        deviceWearers: Array<{
          name: string
          deviceId: number
          nomisId: string
          positions: Array<{
            latitude: number
            longitude: number
            sequenceLabel: string
            confidence: number
            capturedDateTime: string
          }>
        }>
      } | null
    }
  }
}

type StubGetCrimeVersionErrorOptions = {
  status: 404 | 500
  crimeVersionId
  response: string
}

type StubGetCrimeVersionOptions = StubGetCrimeVersion200Options | StubGetCrimeVersionErrorOptions

const stubGetCrimeVersion = (options: StubGetCrimeVersionOptions) => {
  const urlPattern = `${baseUrl}/crime-versions/${options.crimeVersionId}`

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

export { stubGetCrimeVersion, StubGetCrimeVersionOptions }
