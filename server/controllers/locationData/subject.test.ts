import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import createMockLogger from '../../testutils/createMockLogger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import SubjectService from '../../services/locationData/subject'
import SubjectController from './subject'

dayjs.extend(utc)
dayjs.extend(timezone)

jest.mock('@ministryofjustice/hmpps-rest-client')

describe('SubjectController', () => {
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

  describe('search', () => {
    it('should redirect to the view containing results if successful response', async () => {
      // Given
      const fromDateInput = {
        date: '1/2/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '2/2/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const orderStartDate = '2025-01-01T02:00:00.000Z'

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate,
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).toHaveBeenCalledWith(
        {
          data: {
            personId: '1',
            fromDate: '2025-02-01T01:01:01.000Z',
            toDate: '2025-02-02T01:01:01.000Z',
          },
          path: '/subject/location-query',
        },
        undefined,
      )
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subject?queryId=1234')
    })

    it('should redirect to a view containing a validation error message if no input dates provided', async () => {
      // Given
      const emptyDateInput = {
        date: '',
        hour: '',
        minute: '',
        second: '',
      }

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: emptyDateInput,
          toDate: emptyDateInput,
          orderStartDate: '2025-01-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'You must enter a valid value for date',
        },
        {
          field: 'toDate',
          message: 'You must enter a valid value for date',
        },
      ])
    })

    it('should redirect to a view containing a validation error message if to input date before from input date', async () => {
      // Given
      const fromDateInput = {
        date: '2/2/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '1/2/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate: '2025-01-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'To date must be after From date',
        },
      ])
    })

    it('should redirect to a view containing a validation error message if dates exceed maximum window', async () => {
      // Given
      const fromDateInput = {
        date: '1/2/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '4/2/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate: '2025-01-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'Date and time search window should not exceed 48 hours',
        },
      ])
    })

    it('should redirect to a view containing a validation error message if input dates are outside of order date range', async () => {
      // Given
      const fromDateInput = {
        date: '1/1/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '1/1/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate: '2025-02-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'Date and time search window should be within Order date range',
        },
      ])
    })
  })

  describe('view', () => {
    it('should display the subject view with no location data', async () => {
      // Given
      const personId = '1'
      const from = '2025-01-01T00:00:00Z'
      const to = '2025-01-02T00:00:00Z'
      const req = createMockRequest({
        params: {
          personId,
        },
        query: {
          from,
          to,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.get.mockResolvedValue({
        locations: [],
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: `/subjects/${personId}`,
          query: {
            from,
            to,
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/subject', {
        alerts: [
          {
            dismissible: false,
            showTitleAsHeading: true,
            text: '',
            title: 'No GPS Data for Dates and Times Selected',
            variant: 'warning',
          },
        ],
        points: '[]',
        lines: '[]',
        tileUrl: 'http://localhost:9090/maps',
      })
    })

    it('should display the subject view with no location data', async () => {
      // Given
      const personId = '1'
      const from = '2025-01-01T00:00:00Z'
      const to = '2025-01-02T00:00:00Z'
      const req = createMockRequest({
        params: {
          personId,
        },
        query: {
          from,
          to,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.get.mockResolvedValue({
        locations: [
          {
            locationRef: 1,
            point: {
              latitude: 123.123,
              longitude: 123.123,
            },
            confidenceCircle: 10,
            speed: 5,
            direction: 180,
            timestamp: '2025-01-01T00:00:00Z',
            geolocationMechanism: 1,
          },
          {
            locationRef: 2,
            point: {
              latitude: 456.123,
              longitude: 456.123,
            },
            confidenceCircle: 20,
            speed: 7,
            direction: 210,
            timestamp: '2025-01-01T00:01:00Z',
            geolocationMechanism: 1,
          },
        ],
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: `/subjects/${personId}`,
          query: {
            from,
            to,
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/subject', {
        alerts: [],
        points: JSON.stringify([
          {
            type: 'Feature',
            id: '0',
            properties: {
              '@id': '0',
              speed: 5,
              direction: 180,
              geolocationMechanism: 1,
              timestamp: '2025-01-01T00:00:00Z',
              confidence: 10,
              point: { latitude: 123.123, longitude: 123.123 },
              type: 'location-point',
            },
            geometry: {
              type: 'Point',
              coordinates: [123.123, 123.123],
            },
          },
          {
            type: 'Feature',
            id: '1',
            properties: {
              '@id': '1',
              speed: 7,
              direction: 210,
              geolocationMechanism: 1,
              timestamp: '2025-01-01T00:01:00Z',
              confidence: 20,
              point: { latitude: 456.123, longitude: 456.123 },
              type: 'location-point',
            },
            geometry: {
              type: 'Point',
              coordinates: [456.123, 456.123],
            },
          },
        ]),
        lines: JSON.stringify([
          {
            type: 'Feature',
            id: '0',
            properties: { '@id': '0', direction: 180 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [123.123, 123.123],
                [456.123, 456.123],
              ],
            },
          },
        ]),
        tileUrl: 'http://localhost:9090/maps',
      })
    })
  })
})
