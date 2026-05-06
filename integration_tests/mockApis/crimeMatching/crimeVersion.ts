import { stubFor } from '../wiremock'

// Wiremock base path
const baseUrl = '/crime-matching'

type StubGetCrimeVersion200Options = {
  status: 200
  crimeVersionId: string
  response: {
    data: {
      crimeVersionId: string
      crimeReference: string
      batchId: string
      crimeTypeDescription: string
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
            capturedDateTime: string
            direction: number
            latitude: number
            longitude: number
            precision: number
            sequenceLabel: string
            speed: number
          }>
        }>
      } | null
    }
  }
}

type StubGetCrimeVersionErrorOptions = {
  status: 404 | 500
  crimeVersionId: string
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
