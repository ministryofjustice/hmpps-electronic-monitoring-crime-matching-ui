import logger from '../../logger'
import CrimeMatchingApiClient from '../data/crimeMatchingApiClient'
import { SubjctSearchFormInput } from '../types/subjectSearchFormInput'

export default class SubjectService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingApiClient) {}

  async getSearchResults(input: SubjctSearchFormInput, userToken: string) {
    try {
      const res = await this.crimeMatchingApiClient.searchSubjects(input, userToken)
      return res
    } catch (error) {
      // TODO general error handling (Test)
      logger.error(error, 'Error submitting search query')
      throw error
    }
  }
}
