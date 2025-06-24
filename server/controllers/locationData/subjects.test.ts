import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import { ZodError } from 'zod/v4'
import getMockSubject from '../../../test/mocks/mockSubject'
import createMockLogger from '../../testutils/createMockLogger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import SubjectsService from '../../services/locationData/subjects'
import SubjectsController from './subjects'

jest.mock('@ministryofjustice/hmpps-rest-client')

const mockSubject = getMockSubject()

describe('SubjectsController', () => {
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

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('view', () => {
    it('shoud render a view containing subject results if there is a queryId', async () => {
      // Given
      const req = createMockRequest({
        query: {
          queryId: '1234',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      mockRestClient.get.mockResolvedValue({
        data: [mockSubject],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: '/subjects-query',
          query: {
            id: '1234',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        subjects: [mockSubject],
        pageCount: 1,
        pageNumber: 1,
        queryId: '1234',
      })
    })

    it('shoud render a view containing no results if there is no queryId', async () => {
      // Given
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', { subjects: [], pageCount: 1, pageNumber: 1 })
    })

    it('shoud render a view containing no results if the api response is empty', async () => {
      // Given
      const req = createMockRequest({
        query: {
          queryId: '1234',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      mockRestClient.get.mockResolvedValue({
        data: [],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: '/subjects-query',
          query: {
            id: '1234',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        subjects: [],
        pageCount: 1,
        pageNumber: 1,
        queryId: '1234',
      })
    })

    it('should pass pagination query parameters to the api if present', async () => {
      // Given
      const req = createMockRequest({
        query: {
          queryId: '1234',
          page: '2',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      mockRestClient.get.mockResolvedValue({
        data: [mockSubject],
        pageCount: 2,
        pageNumber: 2,
        pageSize: 10,
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: '/subjects-query',
          query: {
            id: '1234',
            page: '2',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        subjects: [mockSubject],
        pageCount: 2,
        pageNumber: 2,
        queryId: '1234',
      })
    })

    it('should throw an error if the "page" query parameter if a non-numerical value', async () => {
      // Given
      const req = createMockRequest({
        query: {
          queryId: '1234',
          page: 'abc',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      // When / Then
      expect(controller.view(req, res, next)).rejects.toBeInstanceOf(ZodError)
      expect(mockRestClient.get).not.toHaveBeenCalled()
    })
  })

  describe('submit search query', () => {
    it('should redirect to the view containing results if successful response', async () => {
      // Given
      const req = createMockRequest({ body: { nomisId: 'foo', name: '' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).toHaveBeenCalledWith(
        {
          data: {
            nomisId: 'foo',
            name: '',
          },
          path: '/subjects-query',
        },
        undefined,
      )
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects?queryId=1234')
    })

    it('should redirect to the view containing no results if there are validation errors', async () => {
      // Given
      const req = createMockRequest({ body: { nomisId: '', name: 'foo' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      mockRestClient.post.mockRejectedValue({
        text: 'Error text',
        responseStatus: 400,
        headers: {},
        data: [{ field: 'name', message: 'A validation message' }],
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).toHaveBeenCalledWith(
        {
          data: {
            nomisId: '',
            name: 'foo',
          },
          path: '/subjects-query',
        },
        undefined,
      )
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
    })

    it('should redirect to the view containing no results and contain a validation error message related to form input', async () => {
      // Given
      const req = createMockRequest({ body: { nomisId: '', name: '' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectsService(mockRestClient)
      const controller = new SubjectsController(service)

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'name',
          message: 'You must enter a value for either Name or NOMIS ID',
        },
      ])
    })
  })
})
