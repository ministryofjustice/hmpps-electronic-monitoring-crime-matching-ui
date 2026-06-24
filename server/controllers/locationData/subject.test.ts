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
import HmppsAuditClient from '../../data/hmppsAuditClient'
import AuditService, { Page } from '../../services/auditService'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

jest.mock('../../services/auditService')
jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

describe('SubjectController', () => {
  const hmppsAuditClient = new HmppsAuditClient({
    queueUrl: '',
    enabled: true,
    region: 'eu-west-2',
    serviceName: '',
  }) as jest.Mocked<HmppsAuditClient>
  const auditService = new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>
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
          personId: '1',
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

      // When
      await controller.search(req, res, next)

      // Then
      expect(auditService.logSearch).toHaveBeenCalledWith(Page.LOCATION_DATA_DEVICE_ACTIVATION, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            deviceActivationId: 1,
          },
          query: {
            fromDate: fromDateInput,
            toDate: toDateInput,
          },
        },
      })
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

      // When
      await controller.search(req, res, next)

      // Then
      expect(auditService.logSearch).toHaveBeenCalledWith(Page.LOCATION_DATA_DEVICE_ACTIVATION, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            deviceActivationId: undefined,
          },
          query: {
            fromDate: emptyDateInput,
            toDate: emptyDateInput,
          },
        },
      })
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

      // When
      await controller.search(req, res, next)

      // Then
      expect(auditService.logSearch).toHaveBeenCalledWith(Page.LOCATION_DATA_DEVICE_ACTIVATION, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            deviceActivationId: undefined,
          },
          query: {
            fromDate: fromDateInput,
            toDate: toDateInput,
          },
        },
      })
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )
      // When
      await controller.search(req, res, next)

      // Then
      expect(auditService.logSearch).toHaveBeenCalledWith(Page.LOCATION_DATA_DEVICE_ACTIVATION, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            deviceActivationId: undefined,
          },
          query: {
            fromDate: fromDateInput,
            toDate: toDateInput,
          },
        },
      })
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
          personId: '1',
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

      // When
      await controller.search(req, res, next)

      // Then
      expect(auditService.logSearch).toHaveBeenCalledWith(Page.LOCATION_DATA_DEVICE_ACTIVATION, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            deviceActivationId: 1,
          },
          query: {
            fromDate: fromDateInput,
            toDate: toDateInput,
          },
        },
      })
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
          personId: '1',
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

      // When
      await controller.search(req, res, next)

      // Then
      expect(auditService.logSearch).toHaveBeenCalledWith(Page.LOCATION_DATA_DEVICE_ACTIVATION, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            deviceActivationId: 1,
          },
          query: {
            fromDate: fromDateInput,
            toDate: toDateInput,
          },
        },
      })
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
          personId: '123456789',
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

      // GET /device-activations/1/positions
      mockRestClient.getDeviceActivationPositions.mockResolvedValue({
        data: [],
      })

      // GET /persons/1
      mockRestClient.getPerson.mockResolvedValue({
        data: {
          personId: '1',
          name: 'Jane Doe',
          nomisId: 'Nomis 1',
          pncRef: 'YY/NNNNNNND',
          address: '123 Street',
          dateOfBirth: '2000-12-01T00:00:00.000Z',
          probationPractitioner: 'John Smith',
          deviceActivations: [],
        },
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
        deviceWearer: {
          personId: '1',
          name: 'Jane Doe',
          nomisId: 'Nomis 1',
          pncRef: 'YY/NNNNNNND',
          address: '123 Street',
          dateOfBirth: '2000-12-01T00:00:00.000Z',
          probationPractitioner: 'John Smith',
          deviceActivations: [],
        },
        positions: [],
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
          personId: '123456789',
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

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

      // GET /persons/1
      mockRestClient.getPerson.mockResolvedValue({
        data: {
          personId: '1',
          name: 'Jane Doe',
          nomisId: 'Nomis 1',
          pncRef: 'YY/NNNNNNND',
          address: '123 Street',
          dateOfBirth: '2000-12-01T00:00:00.000Z',
          probationPractitioner: 'John Smith',
          deviceActivations: [],
        },
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
        deviceWearer: {
          personId: '1',
          name: 'Jane Doe',
          nomisId: 'Nomis 1',
          pncRef: 'YY/NNNNNNND',
          address: '123 Street',
          dateOfBirth: '2000-12-01T00:00:00.000Z',
          probationPractitioner: 'John Smith',
          deviceActivations: [],
        },
        origin: undefined,
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
            displayDirection: 180,
            displayTimestamp: '01/01/2025, 00:00:00',
            overlayTitleTemplateId: 'overlay-title-mdss-location',
            overlayBodyTemplateId: 'overlay-body-mdss-location',
            subjectAddress: '123 Street',
            subjectDateOfBirth: '01/12/2000',
            subjectDeviceId: 123456789,
            subjectName: 'Jane Doe',
            subjectNomisId: 'Nomis 1',
            subjectTagEndDate: '',
            subjectTagStartDate: '01/01/2025',
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
            displayDirection: 210,
            displayTimestamp: '01/01/2025, 00:01:00',
            overlayTitleTemplateId: 'overlay-title-mdss-location',
            overlayBodyTemplateId: 'overlay-body-mdss-location',
            subjectAddress: '123 Street',
            subjectDateOfBirth: '01/12/2000',
            subjectDeviceId: 123456789,
            subjectName: 'Jane Doe',
            subjectNomisId: 'Nomis 1',
            subjectTagEndDate: '',
            subjectTagStartDate: '01/01/2025',
          },
        ],
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

  describe('export', () => {
    it('should export subject location data', async () => {
      // Given
      const deviceActivationId = '1'
      const from = '2025-01-01T00:00:00.000Z'
      const to = '2025-01-02T00:00:00.000Z'
      const reportType = 'full'
      const req = createMockRequest({
        params: {
          deviceActivationId,
        },
        query: {
          from,
          to,
          reportType,
        },
        deviceActivation: {
          deviceActivationId: 1,
          deviceId: 123456789,
          deviceName: '123456789',
          personId: '123456789',
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
      const controller = new SubjectController(
        auditService,
        deviceActivationsService,
        personsService,
        validationService,
      )

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

      // GET /persons/1
      mockRestClient.getPerson.mockResolvedValue({
        data: {
          personId: '1',
          name: 'Jane Doe',
          nomisId: 'Nomis 1',
          pncRef: 'YY/NNNNNNND',
          address: '123 Street',
          dateOfBirth: '2000-12-01T00:00:00.000Z',
          probationPractitioner: 'John Smith',
          deviceActivations: [],
        },
      })

      // When
      await controller.download(req, res, next)

      // Then
      expect(auditService.logExport).toHaveBeenCalledWith(Page.LOCATION_DATA_DEVICE_ACTIVATION, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            deviceActivationId,
          },
          query: {
            from,
            reportType,
            to,
          },
        },
      })

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
      expect(res.setHeader).toHaveBeenNthCalledWith(1, 'Content-Type', 'text/csv')
      expect(res.setHeader).toHaveBeenNthCalledWith(
        2,
        'Content-Disposition',
        'attachment; filename="location-data-123456789-2025-01-01T00:00:00.000Z-2025-01-02T00:00:00.000Z-full.csv"',
      )
      expect(res.send).toHaveBeenCalledWith(
        `DEVICE ID,DEVICE NAME,SUBJECT IDENTIFIER,PoP NAME,NOMIS ID,PNC REF,PoP ADDRESS,PoP DATE OF BIRTH,PROBATION PRACTITIONER,ORDER START,ORDER END,DATE/TIME,LATITUDE,LONGITUDE,CONFIDENCE CIRCLE,SPEED,DIRECTION,SEQUENCE NO.\n123456789,123456789,1,Jane Doe,Nomis 1,YY/NNNNNNND,123 Street,01/12/2000,John Smith,01/12/2024 00:00,31/12/2024 00:00,01/01/2025 00:00,123.123,123.123,10,5,179.99984796050427,1\n123456789,123456789,1,Jane Doe,Nomis 1,YY/NNNNNNND,123 Street,01/12/2000,John Smith,01/12/2024 00:00,31/12/2024 00:00,01/01/2025 00:01,456.123,456.123,20,7,209.9999181135542,2`,
      )
    })
  })
})
