import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import CrimeVersionController from './crimeVersion'
import logger from '../../../logger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import CrimeService from '../../services/crimeService'
import AuditService, { Page } from '../../services/auditService'
import HmppsAuditClient from '../../data/hmppsAuditClient'
import ProximityAlertReportExportService from '../../services/proximityAlert/proximityAlertReportExportService'
import HubManagersService from '../../services/hubManagerService'
import expectedAuthOptions from '../../testutils/expectedAuthOptions'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

jest.mock('../../services/auditService')
jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

const hubManagers = [
  {
    id: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
    name: 'Test manager 1',
    occupation: 'MoJ EM Hub Manager',
    hasSignature: true,
  },
]

describe('CrimeVersionController', () => {
  const hmppsAuditClient = new HmppsAuditClient({
    queueUrl: '',
    enabled: true,
    region: 'eu-west-2',
    serviceName: '',
  }) as jest.Mocked<HmppsAuditClient>
  const auditService = new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>
  let mockRestClient: jest.Mocked<CrimeMatchingClient>
  let mockProximityAlertReportExportService: jest.Mocked<ProximityAlertReportExportService>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>

    mockProximityAlertReportExportService = {
      build: jest.fn(),
    } as unknown as jest.Mocked<ProximityAlertReportExportService>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('view', () => {
    it('should correctly present a crime version with matches to the view engine', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({ params: { crimeVersionId } })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: {
            deviceWearers: [
              {
                name: 'name',
                address: '1 Test Street',
                dateOfBirth: '1985-10-05',
                pncRef: 'PNC123',
                deviceId: 1,
                nomisId: 'nomisId',
                positions: [
                  {
                    capturedDateTime: '2025-01-01T00:00',
                    direction: 10,
                    latitude: 10.0,
                    longitude: 10.0,
                    precision: 10,
                    sequenceLabel: 'A1',
                    speed: 10,
                  },
                  {
                    capturedDateTime: '2025-01-01T02:00',
                    direction: 10,
                    latitude: 10.0,
                    longitude: 10.0,
                    precision: 10,
                    sequenceLabel: 'A2',
                    speed: 10,
                  },
                ],
              },
            ],
          },
        },
      })
      mockRestClient.getHubManagers.mockResolvedValue({ data: hubManagers })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        isHeadless: false,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          matching: {
            deviceWearers: [
              {
                name: 'name',
                address: '1 Test Street',
                dateOfBirth: '1985-10-05',
                pncRef: 'PNC123',
                deviceId: 1,
                nomisId: 'nomisId',
                positions: [
                  {
                    latitude: 10.0,
                    longitude: 10.0,
                    sequenceLabel: 'A1',
                    precision: 10,
                    capturedDateTime: '01/01/2025, 00:00:00',
                    deviceId: 1,
                    direction: 10,
                    name: 'name',
                    nomisId: 'nomisId',
                    speed: 10,
                    overlayTitleTemplateId: 'overlay-title-device-location',
                    overlayBodyTemplateId: 'overlay-body-device-location',
                  },
                  {
                    latitude: 10.0,
                    longitude: 10.0,
                    sequenceLabel: 'A2',
                    precision: 10,
                    capturedDateTime: '01/01/2025, 02:00:00',
                    deviceId: 1,
                    direction: 10,
                    name: 'name',
                    nomisId: 'nomisId',
                    speed: 10,
                    overlayTitleTemplateId: 'overlay-title-device-location',
                    overlayBodyTemplateId: 'overlay-body-device-location',
                  },
                ],
              },
            ],
          },
          versionColour: 'green',
          versionLabel: 'Latest version',
          crimePosition: {
            batchId: 'batch1',
            crimeDateTimeFrom: '01/01/2025, 00:00:00',
            crimeDateTimeTo: '01/01/2025, 01:00:00',
            crimeReference: 'crime1',
            crimeTypeId: 'AB',
            latitude: 10,
            longitude: 10,
            overlayBodyTemplateId: 'overlay-body-crime-location',
            overlayTitleTemplateId: 'overlay-title-crime-location',
            precision: 100,
          },
        },
        exportProximityAlertForm: {
          url: `/proximity-alert/${crimeVersionId}/export-proximity-alert`,
          authorisingManager: undefined,
          selectedDeviceIds: [],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          capturedMapState: undefined,
        },
        hubManagers,
      })
    })

    it('should correctly present a crime version with no matches to the view engine', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({ params: { crimeVersionId } })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: { deviceWearers: [] },
        },
      })
      mockRestClient.getHubManagers.mockResolvedValue({ data: hubManagers })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        isHeadless: false,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          matching: { deviceWearers: [] },
          versionLabel: 'Latest version',
          versionColour: 'green',
          crimePosition: {
            batchId: 'batch1',
            crimeDateTimeFrom: '01/01/2025, 00:00:00',
            crimeDateTimeTo: '01/01/2025, 01:00:00',
            crimeReference: 'crime1',
            crimeTypeId: 'AB',
            latitude: 10,
            longitude: 10,
            overlayBodyTemplateId: 'overlay-body-crime-location',
            overlayTitleTemplateId: 'overlay-title-crime-location',
            precision: 100,
          },
        },
        exportProximityAlertForm: {
          url: `/proximity-alert/${crimeVersionId}/export-proximity-alert`,
          authorisingManager: undefined,
          selectedDeviceIds: [],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          capturedMapState: undefined,
        },
        hubManagers,
      })
    })

    it('should correctly present a crime version with no match data to the view engine', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({ params: { crimeVersionId } })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: null,
        },
      })
      mockRestClient.getHubManagers.mockResolvedValue({ data: hubManagers })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        isHeadless: false,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          matching: null,
          versionColour: 'green',
          versionLabel: 'Latest version',
          crimePosition: {
            batchId: 'batch1',
            crimeDateTimeFrom: '01/01/2025, 00:00:00',
            crimeDateTimeTo: '01/01/2025, 01:00:00',
            crimeReference: 'crime1',
            crimeTypeId: 'AB',
            latitude: 10,
            longitude: 10,
            overlayBodyTemplateId: 'overlay-body-crime-location',
            overlayTitleTemplateId: 'overlay-title-crime-location',
            precision: 100,
          },
        },
        exportProximityAlertForm: {
          url: `/proximity-alert/${crimeVersionId}/export-proximity-alert`,
          authorisingManager: undefined,
          selectedDeviceIds: [],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          capturedMapState: undefined,
        },
        hubManagers,
      })
    })

    it('should present an export warning alert when one exists in session and clear it afterwards', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({ params: { crimeVersionId } })
      req.session.exportProximityAlertState = {
        error: 'Invalid export request.',
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: false,
        showLocationNumbering: true,
        capturedMapState: JSON.stringify({
          mapWidthPx: 1200,
          mapHeightPx: 800,
          devicePixelRatio: 2,
          view: {
            center: [12345, 67890],
            resolution: 4.5,
            rotation: 0,
          },
        }),
      }
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: { deviceWearers: [] },
        },
      })
      mockRestClient.getHubManagers.mockResolvedValue({ data: hubManagers })

      // When
      await controller.view(req, res, next)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        isHeadless: false,
        alerts: [
          {
            variant: 'warning',
            dismissible: true,
            showTitleAsHeading: true,
            title: 'Invalid export request.',
            text: '',
          },
        ],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          matching: { deviceWearers: [] },
          versionLabel: 'Latest version',
          versionColour: 'green',
          crimePosition: {
            batchId: 'batch1',
            crimeDateTimeFrom: '01/01/2025, 00:00:00',
            crimeDateTimeTo: '01/01/2025, 01:00:00',
            crimeReference: 'crime1',
            crimeTypeId: 'AB',
            latitude: 10,
            longitude: 10,
            overlayBodyTemplateId: 'overlay-body-crime-location',
            overlayTitleTemplateId: 'overlay-title-crime-location',
            precision: 100,
          },
        },
        exportProximityAlertForm: {
          url: `/proximity-alert/${crimeVersionId}/export-proximity-alert`,
          authorisingManager: undefined,
          selectedDeviceIds: ['1'],
          selectedTrackDeviceIds: ['1'],
          showConfidenceCircles: false,
          showLocationNumbering: true,
          capturedMapState: JSON.stringify({
            mapWidthPx: 1200,
            mapHeightPx: 800,
            devicePixelRatio: 2,
            view: {
              center: [12345, 67890],
              resolution: 4.5,
              rotation: 0,
            },
          }),
        },
        hubManagers,
      })
      expect(req.session.exportProximityAlertState).toBeUndefined()
    })
  })

  describe('exportProximityAlert', () => {
    it('should redirect back with a session error when the export request is invalid', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({
        params: { crimeVersionId },
        body: {
          authorisingManager: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
          'device-wearer-toggle': ['device-wearer-1'],
          'device-wearer-tracks': ['device-wearer-tracks-1'],
          'analysis-toggles': ['device-wearer-labels-'],
          capturedMapState: '{invalid-json}',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: {
            deviceWearers: [
              {
                name: 'name',
                address: '1 Test Street',
                dateOfBirth: '1985-10-05',
                pncRef: 'PNC123',
                deviceId: 1,
                nomisId: 'nomisId',
                positions: [],
              },
            ],
          },
        },
      })

      // When
      await controller.exportProximityAlert(req, res, next)

      // Then
      expect(auditService.logExport).toHaveBeenCalledWith(Page.PROXIMITY_ALERT_CRIME_VERSION, {
        who: 'fakeUserName',
        correlationId: expect.any(String),
        details: expect.any(Object),
      })
      expect(req.session.exportProximityAlertState).toEqual({
        error: 'Invalid export request.',
        authorisingManager: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: false,
        showLocationNumbering: true,
        capturedMapState: '{invalid-json}',
      })
      expect(req.session.validationErrors).toEqual([
        { field: 'capturedMapState_capturedMapState', message: 'Captured map state must be valid JSON' },
      ])
      expect(res.redirect).toHaveBeenCalledWith(`/proximity-alert/${crimeVersionId}`)
      expect(next).not.toHaveBeenCalled()
      expect(mockProximityAlertReportExportService.build).not.toHaveBeenCalled()
    })

    it('should send a docx when the export request is valid', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const capturedMapState = JSON.stringify({
        mapWidthPx: 1200,
        mapHeightPx: 800,
        devicePixelRatio: 2,
        view: {
          center: [12345, 67890],
          resolution: 4.5,
          rotation: 0,
        },
      })

      const req = createMockRequest({
        params: { crimeVersionId },
        headers: {
          cookie: 'connect.sid=fake-session',
        },
        body: {
          authorisingManager: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
          'device-wearer-toggle': ['device-wearer-1', 'device-wearer-2'],
          'device-wearer-tracks': ['device-wearer-tracks-1'],
          'analysis-toggles': ['device-wearer-circles-', 'device-wearer-labels-'],
          capturedMapState,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      const docxBuffer = Buffer.from('fake-docx')
      const signatureBuffer = Buffer.from('fake-signature')

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: {
            deviceWearers: [
              {
                name: 'name1',
                address: '1 Test Street',
                dateOfBirth: '1985-10-05',
                pncRef: 'PNC123',
                deviceId: 1,
                nomisId: 'nomisId1',
                positions: [
                  {
                    latitude: 10.1,
                    longitude: 20.1,
                    sequenceLabel: 'A1',
                    precision: 15,
                    capturedDateTime: '2025-01-01T00:30:00Z',
                    direction: 10,
                    speed: 5,
                  },
                ],
              },
              {
                name: 'name2',
                address: '2 Test Street',
                dateOfBirth: '1985-10-05',
                pncRef: 'PNC456',
                deviceId: 2,
                nomisId: 'nomisId2',
                positions: [],
              },
            ],
          },
        },
      })

      mockRestClient.getHubManager.mockResolvedValue({ data: hubManagers[0] })
      mockRestClient.getHubManagerSignature.mockResolvedValue(signatureBuffer)
      mockProximityAlertReportExportService.build.mockResolvedValue(docxBuffer)

      // When
      await controller.exportProximityAlert(req, res, next)

      // Then
      expect(auditService.logExport).toHaveBeenCalledWith(Page.PROXIMITY_ALERT_CRIME_VERSION, {
        who: 'fakeUserName',
        correlationId: expect.any(String),
        details: expect.any(Object),
      })
      expect(mockRestClient.getHubManager).toHaveBeenCalledWith(
        expectedAuthOptions,
        'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
      )
      expect(mockRestClient.getHubManagerSignature).toHaveBeenCalledWith(
        expectedAuthOptions,
        'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
      )
      expect(mockProximityAlertReportExportService.build).toHaveBeenCalledWith({
        crimeVersion: expect.objectContaining({
          crimeVersionId,
          crimeReference: 'crime1',
        }),
        cookieHeader: 'connect.sid=fake-session',
        authorisingManager: {
          id: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
          name: 'Test manager 1',
          occupation: 'MoJ EM Hub Manager',
          hasSignature: true,
        },
        authorisingManagerSignature: signatureBuffer,
        selectedDeviceIds: ['1', '2'],
        selectedTrackDeviceIds: ['1'],
        capturedMapState,
        showConfidenceCircles: true,
        showLocationNumbering: true,
      })
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      )
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="proximity-alert-${crimeVersionId}.docx"`,
      )
      expect(res.send).toHaveBeenCalledWith(docxBuffer)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should redirect back with a session error when no device ids are selected', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({
        params: { crimeVersionId },
        body: {
          'device-wearer-tracks': ['device-wearer-tracks-1'],
          'analysis-toggles': ['device-wearer-circles-'],
          authorisingManager: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
          capturedMapState: JSON.stringify({
            mapWidthPx: 1200,
            mapHeightPx: 800,
            devicePixelRatio: 2,
            view: {
              center: [12345, 67890],
              resolution: 4.5,
              rotation: 0,
            },
          }),
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: {
            deviceWearers: [
              {
                name: 'name1',
                address: '1 Test Street',
                dateOfBirth: '1985-10-05',
                pncRef: 'PNC123',
                deviceId: 1,
                nomisId: 'nomisId1',
                positions: [],
              },
            ],
          },
        },
      })

      // When
      await controller.exportProximityAlert(req, res, next)

      // Then
      expect(auditService.logExport).toHaveBeenCalledWith(Page.PROXIMITY_ALERT_CRIME_VERSION, {
        who: 'fakeUserName',
        correlationId: expect.any(String),
        details: expect.any(Object),
      })
      expect(req.session.exportProximityAlertState).toEqual({
        error: 'Select at least one device wearer to export the Proximity Alert report.',
        authorisingManager: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
        selectedDeviceIds: [],
        selectedTrackDeviceIds: [],
        showConfidenceCircles: true,
        showLocationNumbering: false,
        capturedMapState: JSON.stringify({
          mapWidthPx: 1200,
          mapHeightPx: 800,
          devicePixelRatio: 2,
          view: {
            center: [12345, 67890],
            resolution: 4.5,
            rotation: 0,
          },
        }),
      })
      expect(req.session.validationErrors).toEqual(undefined)
      expect(res.redirect).toHaveBeenCalledWith(`/proximity-alert/${crimeVersionId}`)
      expect(next).not.toHaveBeenCalled()
      expect(mockProximityAlertReportExportService.build).not.toHaveBeenCalled()
    })

    it('should redirect back with a session error when no authorising manager selected', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({
        params: { crimeVersionId },
        headers: {
          cookie: 'connect.sid=fake-session',
        },
        body: {
          'device-wearer-toggle': ['device-wearer-1', 'device-wearer-2'],
          'device-wearer-tracks': ['device-wearer-tracks-1'],
          'analysis-toggles': ['device-wearer-circles-', 'device-wearer-labels-'],
          capturedMapState: JSON.stringify({
            mapWidthPx: 1200,
            mapHeightPx: 800,
            devicePixelRatio: 2,
            view: {
              center: [12345, 67890],
              resolution: 4.5,
              rotation: 0,
            },
          }),
        },
      })

      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const hubManagerService = new HubManagersService(mockRestClient)
      const controller = new CrimeVersionController(
        auditService,
        crimeService,
        mockProximityAlertReportExportService,
        hubManagerService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          latestCrimeVersionId: null,
          crimeReference: 'crime1',
          policeForceArea: 'Metropolitan',
          batchId: 'batch1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          versionLabel: 'Latest version',
          latitude: 10.0,
          longitude: 10.0,
          matching: {
            deviceWearers: [
              {
                name: 'name1',
                address: '1 Test Street',
                dateOfBirth: '1985-10-05',
                pncRef: 'PNC123',
                deviceId: 1,
                nomisId: 'nomisId1',
                positions: [],
              },
            ],
          },
        },
      })

      // When
      await controller.exportProximityAlert(req, res, next)

      // Then
      expect(auditService.logExport).toHaveBeenCalledWith(Page.PROXIMITY_ALERT_CRIME_VERSION, {
        who: 'fakeUserName',
        correlationId: expect.any(String),
        details: expect.any(Object),
      })
      expect(req.session.exportProximityAlertState).toEqual({
        error: 'Invalid export request.',
        selectedDeviceIds: ['1', '2'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: true,
        showLocationNumbering: true,
        capturedMapState: JSON.stringify({
          mapWidthPx: 1200,
          mapHeightPx: 800,
          devicePixelRatio: 2,
          view: {
            center: [12345, 67890],
            resolution: 4.5,
            rotation: 0,
          },
        }),
      })
      expect(req.session.validationErrors).toEqual([
        {
          field: 'authorisingManager',
          message: 'Select an authorising manager',
        },
      ])
      expect(res.redirect).toHaveBeenCalledWith(`/proximity-alert/${crimeVersionId}`)
      expect(next).not.toHaveBeenCalled()
      expect(mockProximityAlertReportExportService.build).not.toHaveBeenCalled()
    })
  })
})
