import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import createMockLogger from '../../testutils/createMockLogger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import SubjectService from '../../services/locationData/subject'
import SubjectController from './subject'
import DeviceActivationsService from '../../services/deviceActivationsService'
import ValidationService from '../../services/locationData/validationService'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

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

      const req = createMockRequest({
        body: {
          fromDate: fromDateInput,
          toDate: toDateInput,
        },
        deviceActivation: {
          deviceActivationId: 1,
          deviceId: 123456,
          personId: 1,
          deviceActivationDate: '2024-12-01T00:00:00.000Z',
          deviceDeactivationDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(service, deviceActivationsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(
        '/location-data/device-activations/1?from=2025-02-01T01:01:01.000Z&to=2025-02-02T01:01:01.000Z',
      )
    })

    it('should redirect to the device activation search containing a validation error message if no input dates provided', async () => {
      // Given
      const emptyDateInput = {
        date: '',
        hour: '',
        minute: '',
        second: '',
      }

      const req = createMockRequest({
        body: {
          origin: '/location-data/subjects?name=foo&nomisId=',
          fromDate: emptyDateInput,
          toDate: emptyDateInput,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(service, deviceActivationsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects?name=foo&nomisId=')
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

    it('should redirect to the position view containing a validation error message if to input date before from input date', async () => {
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
          origin: '/location-data/device-activations/1',
          fromDate: fromDateInput,
          toDate: toDateInput,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(service, deviceActivationsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/location-data/device-activations/1')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'toDate',
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
          origin: '/location-data/device-activations/1',
          fromDate: fromDateInput,
          toDate: toDateInput,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(service, deviceActivationsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/location-data/device-activations/1')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'Date and time search window should not exceed 48 hours',
        },
      ])
    })

    it('should redirect to a view containing a validation error message if input dates are outside of device activation date range', async () => {
      // Given
      const fromDateInput = {
        date: '1/1/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '2/1/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const req = createMockRequest({
        deviceActivation: {
          deviceActivationId: 1,
          deviceId: 123456,
          personId: 1,
          deviceActivationDate: '2024-12-01T00:00:00.000Z',
          deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
        },
        body: {
          origin: '/location-data/device-activations/1',
          fromDate: fromDateInput,
          toDate: toDateInput,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(service, deviceActivationsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/location-data/device-activations/1')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'Date and time search window should be within device activation date range',
        },
      ])
    })
  })

  describe('view', () => {
    it('should display the subject view with no location data', async () => {
      // Given
      const deviceActivationId = '1'
      const from = '2025-01-01T00:00:00.000Z'
      const to = '2025-01-02T00:00:00.000Z'
      const req = createMockRequest({
        params: {
          deviceActivationId,
        },
        query: {
          from,
          to,
        },
        deviceActivation: {
          deviceActivationId: 1,
          deviceId: 123456789,
          personId: 123456789,
          deviceActivationDate: '2025-01-01T00:00:00.000Z',
          deviceDeactivationDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(service, deviceActivationsService, validationService)

      // GET /device-activations/1/positions
      mockRestClient.get.mockResolvedValue({
        data: [],
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: `/device-activations/${deviceActivationId}/positions`,
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
        points: [],
        lines: [],
        tileUrl: '',
        vectorUrl: '',
        formData: {
          fromDate: {
            date: '01/01/2025',
            hour: '00',
            minute: '00',
            second: '00',
          },
          toDate: {
            date: '02/01/2025',
            hour: '00',
            minute: '00',
            second: '00',
          },
        },
      })
    })

    it('should display the subject view with location data', async () => {
      // Given
      const deviceActivationId = '1'
      const from = '2025-01-01T00:00:00.000Z'
      const to = '2025-01-02T00:00:00.000Z'
      const req = createMockRequest({
        params: {
          deviceActivationId,
        },
        query: {
          from,
          to,
        },
        deviceActivation: {
          deviceActivationId: 1,
          deviceId: 123456789,
          personId: 123456789,
          deviceActivationDate: '2025-01-01T00:00:00.000Z',
          deviceDeactivationDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(service, deviceActivationsService, validationService)

      // GET /device-activations/1/positions
      mockRestClient.get.mockResolvedValue({
        data: [
          {
            locationRef: 1,
            point: {
              latitude: 123.123,
              longitude: 123.123,
            },
            confidenceCircle: 10,
            speed: 5,
            direction: 3.14159,
            timestamp: '2025-01-01T00:00:00Z',
            geolocationMechanism: 1,
            sequenceNumber: 1,
          },
          {
            locationRef: 2,
            point: {
              latitude: 456.123,
              longitude: 456.123,
            },
            confidenceCircle: 20,
            speed: 7,
            direction: 3.66519,
            timestamp: '2025-01-01T00:01:00Z',
            geolocationMechanism: 1,
            sequenceNumber: 2,
          },
        ],
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.get).toHaveBeenCalledWith(
        {
          path: `/device-activations/${deviceActivationId}/positions`,
          query: {
            from,
            to,
          },
        },
        undefined,
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/subject', {
        alerts: [],
        points: [
          {
            type: 'Feature',
            id: '0',
            properties: {
              '@id': '0',
              confidence: 10,
              type: 'pop-location',
              sequenceNumber: 1,

              overlayTemplateId: 'overlay-template-pop-location',
              displaySpeed: '5 km/h',
              displayDirection: '180°',
              displayGeolocationMechanism: '1',
              displayTimestamp: '2025-01-01T00:00:00Z',
              displayConfidence: '10m',
              displayLatitude: '123.123',
              displayLongitude: '123.123',
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
              confidence: 20,
              type: 'pop-location',
              sequenceNumber: 2,

              overlayTemplateId: 'overlay-template-pop-location',
              displaySpeed: '7 km/h',
              displayDirection: '210°',
              displayGeolocationMechanism: '1',
              displayTimestamp: '2025-01-01T00:01:00Z',
              displayConfidence: '20m',
              displayLatitude: '456.123',
              displayLongitude: '456.123',
            },
            geometry: {
              type: 'Point',
              coordinates: [456.123, 456.123],
            },
          },
        ],
        lines: [
          {
            type: 'Feature',
            id: '0',
            properties: { '@id': '0', direction: 3.14159 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [123.123, 123.123],
                [456.123, 456.123],
              ],
            },
          },
        ],
        tileUrl: '',
        vectorUrl: '',
        formData: {
          fromDate: {
            date: '01/01/2025',
            hour: '00',
            minute: '00',
            second: '00',
          },

          toDate: {
            date: '02/01/2025',
            hour: '00',
            minute: '00',
            second: '00',
          },
        },
      })
    })
  })
})
