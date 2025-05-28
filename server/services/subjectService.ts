import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import { SubjectSearchFormInput } from '../models/subjectSearchFormInput'
import { Subject, SubjectModel } from '../models/subject'
import { QueryExecutionResponse, QueryExecutionResponseModel } from '../models/queryExecutionResponse'

export default class SubjectService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async getSearchResults(queryId: string, userToken: string): Promise<Subject[]> {
    try {
      const res = await this.crimeMatchingApiClient.get<Subject[]>(
        {
          path: `/subjects?id='${queryId}`,
        },
        asUser(userToken),
      )

      return res.map(subject => SubjectModel.parse(subject))
    } catch (error) {
      logger.error(error, 'Error retrieving search results')
      throw error
    }
  }

  async submitSearchQuery(input: SubjectSearchFormInput, userToken: string): Promise<QueryExecutionResponse> {
    try {
      const res = await this.crimeMatchingApiClient.post<QueryExecutionResponse>(
        {
          path: '/subjects',
          data: input,
        },
        // TODO test auth is working as expected
        asUser(userToken),
      )
      return QueryExecutionResponseModel.parse(res)
    } catch (error) {
      logger.error(error, 'Error submitting search query')
      throw error
    }
  }
}
