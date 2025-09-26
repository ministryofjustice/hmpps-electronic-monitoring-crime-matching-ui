import { AuthOptions, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import config from '../config'

export default class CrimeMatchingClient extends RestClient {
  constructor(logger: Logger, authenticationClient?: AuthenticationClient) {
    super('Crime Matching Api', config.apis.crimeMatchingApi, logger, authenticationClient)
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
}
