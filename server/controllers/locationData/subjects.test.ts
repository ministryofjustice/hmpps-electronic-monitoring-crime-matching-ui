import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import { ZodError } from 'zod/v4'
import createMockPerson from '../../testutils/createMockPerson'
import createMockLogger from '../../testutils/createMockLogger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import PersonsService from '../../services/personsService'
import SubjectsController from './subjects'

jest.mock('@ministryofjustice/hmpps-rest-client')

const mockSubject = createMockPerson()

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
    it('should query the api and render a view containing persons if there is a name query parameter', async () => {
      // Given
      const req = createMockRequest({
        query: {
          name: 'foo',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
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
          path: '/persons',
          query: {
            name: 'foo',
            nomisId: '',
            include_device_activations: true,
            page: '1',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        name: 'foo',
        nomisId: '',
        persons: [mockSubject],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should query the api and render a view containing persons if there is a nomisId query parameter', async () => {
      // Given
      const req = createMockRequest({
        query: {
          nomisId: 'foo',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
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
          path: '/persons',
          query: {
            name: '',
            nomisId: 'foo',
            include_device_activations: true,
            page: '1',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        name: '',
        nomisId: 'foo',
        persons: [mockSubject],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should render a view containing no results if there is no name or nomisId in the query params', async () => {
      // Given
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new SubjectsController(service)

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        name: '',
        nomisId: '',
        persons: [],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should render a view containing no results if the api response is empty', async () => {
      // Given
      const req = createMockRequest({
        query: {
          name: 'foo',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
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
          path: '/persons',
          query: {
            name: 'foo',
            nomisId: '',
            include_device_activations: true,
            page: '1',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        name: 'foo',
        nomisId: '',
        persons: [],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should pass pagination query parameters to the api if present', async () => {
      // Given
      const req = createMockRequest({
        query: {
          name: 'foo',
          page: '2',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
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
          path: '/persons',
          query: {
            name: 'foo',
            nomisId: '',
            include_device_activations: true,
            page: '2',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        name: 'foo',
        nomisId: '',
        persons: [mockSubject],
        pageCount: 2,
        pageNumber: 2,
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
      const service = new PersonsService(mockRestClient)
      const controller = new SubjectsController(service)

      // When / Then
      expect(controller.view(req, res, next)).rejects.toBeInstanceOf(ZodError)
      expect(mockRestClient.get).not.toHaveBeenCalled()
    })
  })

  describe('submit search query', () => {
    it('should redirect to the view if a name search term is submitted', async () => {
      // Given
      const req = createMockRequest({ body: { name: 'foo', nomisId: '' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new SubjectsController(service)

      // When
      await controller.search(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects?name=foo&nomisId=')
    })

    it('should redirect to the view if a nomisId search term is submitted', async () => {
      // Given
      const req = createMockRequest({ body: { name: '', nomisId: 'foo' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new SubjectsController(service)

      // When
      await controller.search(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects?name=&nomisId=foo')
    })

    it('should redirect to the view with a validation error message if no search terms submitted', async () => {
      // Given
      const req = createMockRequest({ body: { nomisId: '', name: '' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
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
