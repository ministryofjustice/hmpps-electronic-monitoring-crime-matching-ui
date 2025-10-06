import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import logger from '../../../logger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import SubjectController from './subject'
import DeviceActivationsService from '../../services/deviceActivationsService'
import ValidationService from '../../services/locationData/validationService'
import PersonsService from '../../services/personsService'
import CrimeMatchingClient from '../../data/crimeMatchingClient'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

describe('SubjectController', () => {
  let mockRestClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
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
          deviceName: '123456',
          personId: 1,
          deviceActivationDate: '2024-12-01T00:00:00.000Z',
          deviceDeactivationDate: null,
          orderStart: '2024-12-01T00:00:00.000Z',
          orderEnd: '2024-12-31T00:00:00.000Z',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

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
          origin: '/location-data/persons?name=foo&nomisId=',
          fromDate: emptyDateInput,
          toDate: emptyDateInput,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/location-data/persons?name=foo&nomisId=')
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
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

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

    it('should redirect to a view containing a validation error message to date before if dates exceed maximum window', async () => {
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
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

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

    it('should redirect to a view containing a validation error message if from date is before device activation', async () => {
      // Given
      const fromDateInput = {
        date: '30/11/2024',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '1/12/2024',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const req = createMockRequest({
        deviceActivation: {
          deviceActivationId: 1,
          deviceId: 123456,
          deviceName: '123456',
          personId: 1,
          deviceActivationDate: '2024-12-01T00:00:00.000Z',
          deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
          orderStart: '2024-12-01T00:00:00.000Z',
          orderEnd: '2024-12-31T00:00:00.000Z',
        },
        body: {
          origin: '/location-data/device-activations/1',
          fromDate: fromDateInput,
          toDate: toDateInput,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/location-data/device-activations/1')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'Update date to inside tag period',
        },
      ])
    })

    it('should redirect to a view containing a validation error message if to date is after device deactivation', async () => {
      // Given
      const fromDateInput = {
        date: '01/01/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '02/01/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const req = createMockRequest({
        deviceActivation: {
          deviceActivationId: 1,
          deviceId: 123456,
          deviceName: '123456',
          personId: 1,
          deviceActivationDate: '2024-12-01T00:00:00.000Z',
          deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
          orderStart: '2024-12-01T00:00:00.000Z',
          orderEnd: '2024-12-31T00:00:00.000Z',
        },
        body: {
          origin: '/location-data/device-activations/1',
          fromDate: fromDateInput,
          toDate: toDateInput,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/location-data/device-activations/1')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'toDate',
          message: 'Update date to inside tag period',
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
          deviceName: '123456789',
          personId: 123456789,
          deviceActivationDate: '2025-01-01T00:00:00.000Z',
          deviceDeactivationDate: null,
          orderStart: '2024-12-01T00:00:00.000Z',
          orderEnd: '2024-12-31T00:00:00.000Z',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

      // GET /device-activations/1/positions
      mockRestClient.getDeviceActivationPositions.mockResolvedValue({
        data: [],
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getDeviceActivationPositions).toHaveBeenCalledWith(
        {
          tokenType: 'SYSTEM_TOKEN',
          user: {
            username: 'fakeUserName',
          },
        },
        Number(deviceActivationId),
        from,
        to,
        'GPS',
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
        apiKey: '',
        geoJson: {
          type: 'FeatureCollection',
          features: [],
          origin: undefined,
        },
        positions: [],
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
        exportForm: {
          enabled: true,
          from,
          to,
          url: `/location-data/device-activations/${deviceActivationId}/download`,
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
          deviceName: '123456789',
          personId: 123456789,
          deviceActivationDate: '2025-01-01T00:00:00.000Z',
          deviceDeactivationDate: null,
          orderStart: '2024-12-01T00:00:00.000Z',
          orderEnd: '2024-12-31T00:00:00.000Z',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const deviceActivationsService = new DeviceActivationsService(mockRestClient)
      const personsService = new PersonsService(mockRestClient)
      const validationService = new ValidationService(deviceActivationsService)
      const controller = new SubjectController(deviceActivationsService, personsService, validationService)

      // GET /device-activations/1/positions
      mockRestClient.getDeviceActivationPositions.mockResolvedValue({
        data: [
          {
            positionId: 1,
            latitude: 123.123,
            longitude: 123.123,
            precision: 10,
            speed: 5,
            direction: 3.14159,
            timestamp: '2025-01-01T00:00:00Z',
            geolocationMechanism: 'GPS',
          },
          {
            positionId: 2,
            latitude: 456.123,
            longitude: 456.123,
            precision: 20,
            speed: 7,
            direction: 3.66519,
            timestamp: '2025-01-01T00:01:00Z',
            geolocationMechanism: 'GPS',
          },
        ],
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getDeviceActivationPositions).toHaveBeenCalledWith(
        {
          tokenType: 'SYSTEM_TOKEN',
          user: {
            username: 'fakeUserName',
          },
        },
        Number(deviceActivationId),
        from,
        to,
        'GPS',
      )
      expect(res.render).toHaveBeenCalledWith('pages/locationData/subject', {
        alerts: [],
        apiKey: '',
        origin: undefined,
        geoJson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: '1',
              properties: {
                '@id': '1',
                confidence: 10,
                sequenceNumber: 1,
                overlayTemplateId: 'overlay-template-mdss-location',
                displaySpeed: '5 km/h',
                displayDirection: '180°',
                displayGeolocationMechanism: 'GPS',
                displayTimestamp: '2025-01-01T00:00:00Z',
                displayConfidence: '10m',
                displayLatitude: '123.123',
                displayLongitude: '123.123',
                type: 'mdss-location',
                speed: 5,
                direction: 3.14159,
                geolocationMechanism: 'GPS',
                timestamp: '2025-01-01T00:00:00Z',
              },
              geometry: {
                type: 'Point',
                coordinates: [123.123, 123.123],
              },
            },
            {
              type: 'Feature',
              id: '2',
              properties: {
                '@id': '2',
                confidence: 20,
                sequenceNumber: 2,
                overlayTemplateId: 'overlay-template-mdss-location',
                displaySpeed: '7 km/h',
                displayDirection: '210°',
                displayGeolocationMechanism: 'GPS',
                displayTimestamp: '2025-01-01T00:01:00Z',
                displayConfidence: '20m',
                displayLatitude: '456.123',
                displayLongitude: '456.123',
                type: 'mdss-location',
                speed: 7,
                direction: 3.66519,
                geolocationMechanism: 'GPS',
                timestamp: '2025-01-01T00:01:00Z',
              },
              geometry: {
                type: 'Point',
                coordinates: [456.123, 456.123],
              },
            },
            {
              type: 'Feature',
              id: '1-2',
              properties: {
                '@id': '1-2',
                type: 'mdss-line',
                direction: 3.14159,
              },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [123.123, 123.123],
                  [456.123, 456.123],
                ],
              },
            },
          ],
        },
        positions: [
          {
            direction: 3.14159,
            geolocationMechanism: 'GPS',
            latitude: 123.123,
            longitude: 123.123,
            positionId: 1,
            precision: 10,
            sequenceNumber: 1,
            speed: 5,
            timestamp: '2025-01-01T00:00:00Z',
          },
          {
            direction: 3.66519,
            geolocationMechanism: 'GPS',
            latitude: 456.123,
            longitude: 456.123,
            positionId: 2,
            precision: 20,
            sequenceNumber: 2,
            speed: 7,
            timestamp: '2025-01-01T00:01:00Z',
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
        exportForm: {
          enabled: true,
          from,
          to,
          url: `/location-data/device-activations/${deviceActivationId}/download`,
        },
      })
    })
  })
})
