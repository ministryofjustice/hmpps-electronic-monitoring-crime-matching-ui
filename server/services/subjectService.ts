import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import { SubjectSearchFormInput } from '../models/subjectSearchFormInput'
import { QueryExecutionResponse, QueryExecutionResponseModel } from '../schemas/queryExecutionResponse'
import PageResultModel, { PageResult } from '../schemas/PageResult'

export default class SubjectService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async getSearchResults(queryId: string, userToken: string, page: number): Promise<PageResult> {
    try {
      const res = await this.crimeMatchingApiClient.get<PageResult[]>(
        {
          // TODO Change pagesize to 10 as default for now?
          path: `/subjects?id=${queryId}&page=${page}&pageSize=3`,
        },
        asUser(userToken),
      )
      return PageResultModel.parse(res)
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
        asUser(userToken),
      )
      return QueryExecutionResponseModel.parse(res)
    } catch (error) {
      logger.error(error, 'Error submitting search query')
      throw error
    }
  }
}
