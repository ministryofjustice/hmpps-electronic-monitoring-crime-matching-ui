import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import CrimeVersionController from './crimeVersion'
import logger from '../../../logger'
import config from '../../config'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import CrimeService from '../../services/crimeService'
import PlaywrightBrowserService from '../../services/proximityAlert/playwrightBrowserService'
import MapImageRendererService from '../../services/proximityAlert/proximityAlertMapImageService'
import ProximityAlertReportDocxService from '../../services/proximityAlert/proximityAlertReportDocxService'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

const expectedAuthOptions = {
  tokenType: 'SYSTEM_TOKEN',
  user: {
    username: 'fakeUserName',
  },
}

describe('CrimeVersionController', () => {
  let mockRestClient: jest.Mocked<CrimeMatchingClient>
  let mockPlaywrightBrowserService: jest.Mocked<PlaywrightBrowserService>
  let mockMapImageRendererService: jest.Mocked<MapImageRendererService>
  let mockProximityAlertReportDocxService: jest.Mocked<ProximityAlertReportDocxService>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>

    mockPlaywrightBrowserService = {
      getBrowser: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<PlaywrightBrowserService>

    mockMapImageRendererService = {
      render: jest.fn(),
    } as unknown as jest.Mocked<MapImageRendererService>

    mockProximityAlertReportDocxService = {
      build: jest.fn(),
    } as unknown as jest.Mocked<ProximityAlertReportDocxService>
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
      const controller = new CrimeVersionController(
        crimeService,
        mockPlaywrightBrowserService,
        mockMapImageRendererService,
        mockProximityAlertReportDocxService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
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
                deviceId: 1,
                nomisId: 'nomisId',
                positions: [
                  {
                    latitude: 10.0,
                    longitude: 10.0,
                    sequenceLabel: 'A1',
                    confidence: 10,
                    capturedDateTime: '2025-01-01T00:00',
                  },
                  {
                    latitude: 10.0,
                    longitude: 10.0,
                    sequenceLabel: 'A2',
                    confidence: 10,
                    capturedDateTime: '2025-01-01T02:00',
                  },
                ],
              },
            ],
          },
        },
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          matching: {
            deviceWearers: [
              {
                name: 'name',
                deviceId: 1,
                nomisId: 'nomisId',
                positions: [
                  {
                    latitude: 10.0,
                    longitude: 10.0,
                    sequenceLabel: 'A1',
                    precision: 10,
                    capturedDateTime: '01/01/2025 00:00',
                    deviceId: 1,
                    direction: 0,
                    name: 'name',
                    nomisId: 'nomisId',
                    speed: 0,
                    overlayTitleTemplateId: 'overlay-title-device-location',
                    overlayBodyTemplateId: 'overlay-body-device-location',
                  },
                  {
                    latitude: 10.0,
                    longitude: 10.0,
                    sequenceLabel: 'A2',
                    precision: 10,
                    capturedDateTime: '01/01/2025 02:00',
                    deviceId: 1,
                    direction: 0,
                    name: 'name',
                    nomisId: 'nomisId',
                    speed: 0,
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
            crimeDateTimeFrom: '01/01/2025 00:00',
            crimeDateTimeTo: '01/01/2025 01:00',
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
          selectedDeviceIds: [],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          capturedMapState: undefined,
        },
      })
    })

    it('should correctly present a crime version with no matches to the view engine', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({ params: { crimeVersionId } })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const controller = new CrimeVersionController(
        crimeService,
        mockPlaywrightBrowserService,
        mockMapImageRendererService,
        mockProximityAlertReportDocxService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
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

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
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
            crimeDateTimeFrom: '01/01/2025 00:00',
            crimeDateTimeTo: '01/01/2025 01:00',
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
          selectedDeviceIds: [],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          capturedMapState: undefined,
        },
      })
    })

    it('should correctly present a crime version with no match data to the view engine', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({ params: { crimeVersionId } })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const controller = new CrimeVersionController(
        crimeService,
        mockPlaywrightBrowserService,
        mockMapImageRendererService,
        mockProximityAlertReportDocxService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
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

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
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
            crimeDateTimeFrom: '01/01/2025 00:00',
            crimeDateTimeTo: '01/01/2025 01:00',
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
          selectedDeviceIds: [],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          capturedMapState: undefined,
        },
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
      const controller = new CrimeVersionController(
        crimeService,
        mockPlaywrightBrowserService,
        mockMapImageRendererService,
        mockProximityAlertReportDocxService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
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

      // When
      await controller.view(req, res, next)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
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
            crimeDateTimeFrom: '01/01/2025 00:00',
            crimeDateTimeTo: '01/01/2025 01:00',
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
          'device-wearer-toggle': ['device-wearer-1'],
          'device-wearer-tracks': ['device-wearer-tracks-1'],
          'analysis-toggles': ['device-wearer-labels-'],
          capturedMapState: '{invalid-json}',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const controller = new CrimeVersionController(
        crimeService,
        mockPlaywrightBrowserService,
        mockMapImageRendererService,
        mockProximityAlertReportDocxService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          crimeReference: 'crime1',
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
            deviceWearers: [{ name: 'name', deviceId: 1, nomisId: 'nomisId', positions: [] }],
          },
        },
      })

      // When
      await controller.exportProximityAlert(req, res, next)

      // Then
      expect(req.session.exportProximityAlertState).toEqual({
        error: 'Invalid export request.',
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: false,
        showLocationNumbering: true,
        capturedMapState: '{invalid-json}',
      })
      expect(res.redirect).toHaveBeenCalledWith(`/proximity-alert/${crimeVersionId}`)
      expect(next).not.toHaveBeenCalled()
    })

    // Skipped as temporarily exporting a zipped file of images rather than the docx file
    it.skip('should send a docx when the export request is valid', async () => {
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
          'device-wearer-toggle': ['device-wearer-1', 'device-wearer-2'],
          'device-wearer-tracks': ['device-wearer-tracks-1'],
          'analysis-toggles': ['device-wearer-circles-', 'device-wearer-labels-'],
          capturedMapState,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const crimeService = new CrimeService(mockRestClient)
      const controller = new CrimeVersionController(
        crimeService,
        mockPlaywrightBrowserService,
        mockMapImageRendererService,
        mockProximityAlertReportDocxService,
      )

      const mockBrowser = {} as Awaited<ReturnType<PlaywrightBrowserService['getBrowser']>>
      const mockImages = {
        overviewUserViewJpg: undefined,
        overviewFittedToDeviceWearersJpg: undefined,
        deviceWearerWithTracksJpgByDeviceId: {},
        deviceWearerFittedWithoutTracksJpgByDeviceId: {},
      }
      const docxBuffer = Buffer.from('fake-docx')

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          crimeReference: 'crime1',
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
              { name: 'name1', deviceId: 1, nomisId: 'nomisId1', positions: [] },
              { name: 'name2', deviceId: 2, nomisId: 'nomisId2', positions: [] },
            ],
          },
        },
      })

      mockPlaywrightBrowserService.getBrowser.mockResolvedValue(mockBrowser)
      mockMapImageRendererService.render.mockResolvedValue(mockImages)
      mockProximityAlertReportDocxService.build.mockResolvedValue(docxBuffer)

      // When
      await controller.exportProximityAlert(req, res, next)

      // Then
      expect(mockPlaywrightBrowserService.getBrowser).toHaveBeenCalled()
      expect(mockMapImageRendererService.render).toHaveBeenCalledWith({
        browser: mockBrowser,
        pageUrl: `${config.ingressUrl}/proximity-alert/${encodeURIComponent(crimeVersionId)}`,
        baseUrlForCookies: config.ingressUrl,
        cookieHeader: 'connect.sid=fake-session',
        selectedDeviceIds: ['1', '2'],
        capturedMapState,
      })
      expect(mockProximityAlertReportDocxService.build).toHaveBeenCalledWith({
        crimeVersion: expect.objectContaining({
          crimeVersionId,
        }),
        deviceIds: ['1', '2'],
        capturedMapState,
        images: mockImages,
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
      const controller = new CrimeVersionController(
        crimeService,
        mockPlaywrightBrowserService,
        mockMapImageRendererService,
        mockProximityAlertReportDocxService,
      )

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          crimeReference: 'crime1',
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
            deviceWearers: [{ name: 'name1', deviceId: 1, nomisId: 'nomisId1', positions: [] }],
          },
        },
      })

      // When
      await controller.exportProximityAlert(req, res, next)

      // Then
      expect(req.session.exportProximityAlertState).toEqual({
        error: 'Select at least one device wearer to export the Proximity Alert report.',
        selectedDeviceIds: [],
        selectedTrackDeviceIds: ['1'],
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
      expect(res.redirect).toHaveBeenCalledWith(`/proximity-alert/${crimeVersionId}`)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
