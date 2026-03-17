import { AuthOptions, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import config from '../config'
import { IngestionAttemptDetail } from '../schemas/policeData/dashboard'

export default class CrimeMatchingClient extends RestClient {
  constructor(logger: Logger, authenticationClient?: AuthenticationClient) {
    super('Crime Matching Api', config.apis.crimeMatchingApi, logger, authenticationClient)
  }

  getCrimeMatchingResults(authOptions: AuthOptions, batchIds: Array<string>): Promise<unknown> {
    return this.get(
      {
        path: '/crime-matching-results',
        query: {
          batchId: batchIds,
        },
      },
      authOptions,
    )
  }

  getCrimeVersions(authOptions: AuthOptions, crimeReference: string, page: string | undefined): Promise<unknown> {
    return this.get(
      {
        path: '/crime-versions',
        query: {
          crimeRef: crimeReference,
          page,
          pageSize: 10,
        },
      },
      authOptions,
    )
  }

  getDeviceActivation(authOptions: AuthOptions, deviceActivationId: string): Promise<unknown> {
    return this.get(
      {
        path: `/device-activations/${deviceActivationId}`,
      },
      authOptions,
    )
  }

  getDeviceActivationPositions(
    authOptions: AuthOptions,
    deviceActivationId: number,
    from: string,
    to: string,
    geolocationMechanism: string,
  ): Promise<unknown> {
    return this.get(
      {
        path: `/device-activations/${deviceActivationId}/positions`,
        query: {
          from,
          to,
          geolocationMechanism,
        },
      },
      authOptions,
    )
  }

  getPerson(authOptions: AuthOptions, personId: number): Promise<unknown> {
    return this.get(
      {
        path: `/persons/${personId}`,
      },
      authOptions,
    )
  }

  getPersonsBySearchTerm(
    authOptions: AuthOptions,
    searchField: string,
    searchTerm: string,
    page: string,
  ): Promise<unknown> {
    return this.get(
      {
        path: '/persons',
        query: {
          [searchField]: searchTerm,
          includeDeviceActivations: true,
          page,
        },
      },
      authOptions,
    )
  }

  getIngestionAttempt(authOptions: AuthOptions, ingestionAttemptId: string): Promise<IngestionAttemptDetail> {
    return this.get(
      {
        path: `/ingestion-attempts/${ingestionAttemptId}`,
      },
      authOptions,
    )
  }

  getValidationErrorCsv(authOptions: AuthOptions, ingestionAttemptId: string): Promise<unknown> {
    return this.get(
      {
        path: `/ingestion-attempts/${ingestionAttemptId}/validation-errors`,
        headers: {
          Accept: 'text/csv',
        },
      },
      authOptions,
    )
  }

  getIngestionAttempts(
    authOptions: AuthOptions,
    batchId: string | undefined,
    policeForceArea: string | undefined,
    fromDate: string | undefined,
    toDate: string | undefined,
    page: string | undefined,
  ): Promise<unknown> {
    return this.get(
      {
        path: `/ingestion-attempts`,
        query: {
          batchId,
          policeForceArea,
          fromDate,
          toDate,
          page,
        },
      },
      authOptions,
    )
  }
}
