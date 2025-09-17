import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import { ZodError } from 'zod/v4'
import logger from '../../../logger'
import createMockPerson from '../../testutils/createMockPerson'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import PersonsService from '../../services/personsService'
import PersonsController from './persons'

jest.mock('@ministryofjustice/hmpps-rest-client')
jest.mock('../../../logger')

const mockPerson = createMockPerson()

describe('PersonsController', () => {
  let mockRestClient: jest.Mocked<RestClient>

  beforeEach(() => {
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
          searchTerm: 'foo',
          searchField: 'name',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      mockRestClient.get.mockResolvedValue({
        data: [mockPerson],
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
            includeDeviceActivations: true,
            page: '1',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        formData: {},
        searchField: 'name',
        searchTerm: 'foo',
        persons: [mockPerson],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should query the api and render a view containing persons if there is a nomisId query parameter', async () => {
      // Given
      const req = createMockRequest({
        query: {
          searchTerm: 'foo',
          searchField: 'nomisId',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      mockRestClient.get.mockResolvedValue({
        data: [mockPerson],
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
            nomisId: 'foo',
            includeDeviceActivations: true,
            page: '1',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        formData: {},
        searchField: 'nomisId',
        searchTerm: 'foo',
        persons: [mockPerson],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should query the api and render a view containing persons if there is a deviceId query parameter', async () => {
      // Given
      const req = createMockRequest({
        query: {
          searchTerm: 'foo',
          searchField: 'deviceId',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      mockRestClient.get.mockResolvedValue({
        data: [mockPerson],
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
            deviceId: 'foo',
            includeDeviceActivations: true,
            page: '1',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        formData: {},
        searchField: 'deviceId',
        searchTerm: 'foo',
        persons: [mockPerson],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should render a view containing no results if there are no query parameters', async () => {
      // Given
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        formData: {},
        searchField: undefined,
        persons: [],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should render a view containing no results if the api response is empty', async () => {
      // Given
      const req = createMockRequest({
        query: {
          searchTerm: 'foo',
          searchField: 'name',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

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
            includeDeviceActivations: true,
            page: '1',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        formData: {},
        searchField: 'name',
        searchTerm: 'foo',
        persons: [],
        pageCount: 1,
        pageNumber: 1,
      })
    })

    it('should pass pagination query parameters to the api if present', async () => {
      // Given
      const req = createMockRequest({
        query: {
          searchTerm: 'foo',
          searchField: 'name',
          page: '2',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      mockRestClient.get.mockResolvedValue({
        data: [mockPerson],
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
            includeDeviceActivations: true,
            page: '2',
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/index', {
        formData: {},
        searchField: 'name',
        searchTerm: 'foo',
        persons: [mockPerson],
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
      const controller = new PersonsController(service)

      // When / Then
      expect(controller.view(req, res, next)).rejects.toBeInstanceOf(ZodError)
      expect(mockRestClient.get).not.toHaveBeenCalled()
    })

    it('should throw an error if the "searchField" query parameter is not provided', async () => {
      // Given
      const req = createMockRequest({
        query: {
          searchTerm: 'foo',
          searchField: '',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      // When
      try {
        await controller.view(req, res, next)
      } catch (e) {
        // Then
        expect((e as Error).name).toEqual('ZodError')
      }
    })
  })

  describe('submit search query', () => {
    it('should redirect to the view if a name search term is submitted', async () => {
      // Given
      const req = createMockRequest({ body: { name: 'foo', nomisId: '', deviceId: '', searchField: 'name' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      // When
      await controller.search(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/location-data/persons?searchField=name&searchTerm=foo')
    })

    it('should redirect to the view if a nomisId search term is submitted', async () => {
      // Given
      const req = createMockRequest({ body: { name: '', nomisId: 'foo', deviceId: '', searchField: 'nomisId' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      // When
      await controller.search(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/location-data/persons?searchField=nomisId&searchTerm=foo')
    })

    it('should redirect to the view if a deviceId search term is submitted', async () => {
      // Given
      const req = createMockRequest({ body: { name: '', nomisId: '', deviceId: 'foo', searchField: 'deviceId' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      // When
      await controller.search(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/location-data/persons?searchField=deviceId&searchTerm=foo')
    })

    it('should redirect to the view with a validation error message if no search terms submitted', async () => {
      // Given
      const req = createMockRequest({ body: { nomisId: '', name: '', deviceId: '', searchField: 'nomisId' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PersonsService(mockRestClient)
      const controller = new PersonsController(service)

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/persons')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'searchField',
          message: 'You must enter a value for Name, NOMIS ID or Device ID',
        },
      ])
    })
  })
})
