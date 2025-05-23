import { asUser, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import Subject from '../models/subject'
import { SubjctSearchFormInput } from '../types/subjectSearchFormInput'

export default class CrimeMatchingApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('crimeMatchingApiClient', config.apis.crimeMatchingApi, logger, authenticationClient)
  }

  searchSubjects(input: SubjctSearchFormInput, userToken: string) {
    // TODO Ensure auth is working correctly
    return this.post<Subject[]>(
      {
        path: '/subjects',
        data: input,
      },
      asUser(userToken),
    )
  }
}
