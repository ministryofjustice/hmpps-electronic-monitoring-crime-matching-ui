import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import SubjectService from './subjectService'
import getMockSubject from '../../test/mocks/mockSubject'
import createMockLogger from '../testutils/createMockLogger'

jest.mock('@ministryofjustice/hmpps-rest-client')

describe('Subject Service', () => {
  let mockRestClient: jest.Mocked<RestClient>
  let logger: jest.Mocked<Logger>
  let subjectService: SubjectService

  const queryExecutionId = 'query-execution-id'
  const queryExecutionResponse = {
    queryExecutionId,
  }
  const searchInput = {
    name: 'test',
    nomisId: '',
  }

  const mockSubject = getMockSubject()

  beforeEach(() => {
    logger = createMockLogger()
    mockRestClient = new RestClient(
      'crimeMatchingApi',
      {
        url: '',
        timeout: { response: 0, deadline: 0 },
        agent: { timeout: 0 },
      },
      logger,
    ) as jest.Mocked<RestClient>
    subjectService = new SubjectService(mockRestClient)
  })

  describe('submitSearchQuery', () => {
    it('should submit a search query and return a query execution id', async () => {
      mockRestClient.post.mockResolvedValue(queryExecutionResponse)

      const res = await subjectService.submitSearchQuery(searchInput, '')

      expect(res).toEqual(expect.objectContaining(queryExecutionResponse))
    })

    it('should throw an error if the api returns an invalid object', async () => {
      mockRestClient.post.mockResolvedValue({})

      expect(subjectService.submitSearchQuery(searchInput, '')).rejects.toThrow()
    })
  })

  describe('getSearchResults', () => {
    it('should get search results', async () => {
      mockRestClient.get.mockResolvedValue([mockSubject])

      const res = await subjectService.getSearchResults(queryExecutionId, '')

      expect(res).toEqual(expect.objectContaining([mockSubject]))
    })

    it('should throw an error if the api returns an invalid object', async () => {
      mockRestClient.get.mockResolvedValue({})

      expect(subjectService.getSearchResults(queryExecutionId, '')).rejects.toThrow()
    })
  })
})
