import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import CrimeBatchesController from './crimeBatches'
import CrimeBatchesService from '../../services/crimeMapping/crimeBatches'
import createMockLogger from '../../testutils/createMockLogger'

jest.mock('@ministryofjustice/hmpps-rest-client')

describe('CrimeBatchesController', () => {
  let logger: jest.Mocked<Logger>
  let mockRestClient: jest.Mocked<RestClient>

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
  })

  describe('view', () => {
    it('should render the view with no data when there is no queryId', async () => {
      // Given
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeBatchesService(mockRestClient)
      const controller = new CrimeBatchesController(service)

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith(
        'pages/crime-mapping/crimeBatches',
        {
          crimeBatches: [],
          pageCount: 1,
          pageNumber: 1
        },
      )
    })

    it('should render the view with no data if the api response is empty', async () => {
      // Given
      const req = createMockRequest({
        query: {
          queryId: '1234',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeBatchesService(mockRestClient)
      const controller = new CrimeBatchesController(service)

      mockRestClient.get.mockResolvedValue({
        data: [],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: '/crime-batches-query?id=1234',
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith(
        'pages/crime-mapping/crimeBatches',
        {
          crimeBatches: [],
          pageCount: 1,
          pageNumber: 1
        },
      )
    })

    it('should render the view with data if the api response has data', async () => {
      // Given
      const req = createMockRequest({
        query: {
          queryId: '1234',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeBatchesService(mockRestClient)
      const controller = new CrimeBatchesController(service)

      mockRestClient.get.mockResolvedValue({
        data: [
        {
          policeForce: 'Police Force 1',
          batch: '01234456789',
          start: '2024-12-01T00:00:00.000Z',
          end: '2024-12-01T23:59:59.000Z',
          time: 10,
          matches: 1,
          ingestionDate: '2024-12-09:00:00.000Z',
          caseloadMappingDate: '2024-12-01T00:00:00.000Z',
          crimeMatchingAlgorithmVersion: 'v0.0.1',
        }
      ],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      }
      )

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: '/crime-batches-query?id=1234',
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith(
        'pages/crime-mapping/crimeBatches',
        {
          crimeBatches: [
            {
              policeForce: 'Police Force 1',
              batch: '01234456789',
              start: '2024-12-01T00:00:00.000Z',
              end: '2024-12-01T23:59:59.000Z',
              time: 10,
              matches: 1,
              ingestionDate: '2024-12-09:00:00.000Z',
              caseloadMappingDate: '2024-12-01T00:00:00.000Z',
              crimeMatchingAlgorithmVersion: 'v0.0.1',
            },
          ],
          pageCount: 1,
          pageNumber: 1
        },
      )
    })
  })

  describe('search', () => {
    it('should redirect back to the view if the server returns validation errors', async () => {
      // Given
      const req = createMockRequest({ body: {} })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeBatchesService(mockRestClient)
      const controller = new CrimeBatchesController(service)

      mockRestClient.post.mockRejectedValue({
        text: 'Error text',
        responseStatus: 400,
        headers: {},
        data: [{ field: 'searchTerm', message: 'A validation message' }],
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).toHaveBeenCalledWith(
        {
          data: {
            searchTerm: '',
          },
          path: '/crime-batches-query',
        },
        undefined,
      )
      expect(res.redirect).toHaveBeenCalledWith('/crime-mapping/crime-batches')
    })

    it('should redirect back to the view if the server returns a successful response', async () => {
      // Given
      const req = createMockRequest({ body: { searchTerm: 'foo' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeBatchesService(mockRestClient)
      const controller = new CrimeBatchesController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).toHaveBeenCalledWith(
        {
          data: {
            searchTerm: 'foo',
          },
          path: '/crime-batches-query',
        },
        undefined,
      )
      expect(res.redirect).toHaveBeenCalledWith('/crime-mapping/crime-batches?queryId=1234')
    })
  })
})
