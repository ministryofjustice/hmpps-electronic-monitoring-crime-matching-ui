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
import MapImageRendererService from '../../services/proximityAlert/mapImageRendererService'
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
          batchId: 'batchId',
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
        usesInternalOverlays: false,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
          batchId: 'batchId',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
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
          versionColour: 'green',
          versionLabel: 'Latest version',
        },
        positions: [
          {
            latitude: 10,
            longitude: 10,
            positionType: 'crime',
            crimeTypeId: 'AB',
            batchId: 'batchId',
            crimeDateTimeFrom: '01/01/2025 00:00',
            crimeDateTimeTo: '01/01/2025 00:00',
            crimeReference: 'crime1',
            overlayBodyTemplateId: 'overlay-body-crime-location',
            overlayTitleTemplateId: 'overlay-title-crime-location',
          },
          {
            precision: 10,
            deviceId: 1,
            geolocationMechanism: 'GPS',
            latitude: 10,
            longitude: 10,
            personName: 'name',
            personNomisId: 'nomisId',
            positionType: 'wearer',
            sequenceLabel: 'A1',
            timestamp: '2025-01-01T00:00',
          },
          {
            precision: 10,
            deviceId: 1,
            geolocationMechanism: 'GPS',
            latitude: 10,
            longitude: 10,
            personName: 'name',
            personNomisId: 'nomisId',
            positionType: 'wearer',
            sequenceLabel: 'A2',
            timestamp: '2025-01-01T02:00',
          },
        ],
        exportProximityAlertForm: {
          url: '/proximity-alert/78d41bd9-5450-4bbb-89d4-42ba75659f50/export-proximity-alert',
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
          batchId: 'batchId',
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
        usesInternalOverlays: false,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
          batchId: 'batchId',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          latitude: 10.0,
          longitude: 10.0,
          matching: { deviceWearers: [] },
          versionLabel: 'Latest version',
          versionColour: 'green',
        },
        positions: [
          {
            latitude: 10,
            longitude: 10,
            positionType: 'crime',
            crimeTypeId: 'AB',
            batchId: 'batchId',
            crimeDateTimeFrom: '01/01/2025 00:00',
            crimeDateTimeTo: '01/01/2025 00:00',
            crimeReference: 'crime1',
            overlayBodyTemplateId: 'overlay-body-crime-location',
            overlayTitleTemplateId: 'overlay-title-crime-location',
          },
        ],
        exportProximityAlertForm: {
          url: '/proximity-alert/78d41bd9-5450-4bbb-89d4-42ba75659f50/export-proximity-alert',
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
          batchId: 'batchId',
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
        usesInternalOverlays: false,
        alerts: [],
        crimeVersion: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
          batchId: 'batchId',
          crimeTypeDescription: 'Aggravated Burglary',
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          latitude: 10.0,
          longitude: 10.0,
          matching: null,
          versionColour: 'green',
          versionLabel: 'Latest version',
        },
        positions: [
          {
            latitude: 10,
            longitude: 10,
            positionType: 'crime',
            crimeTypeId: 'AB',
            batchId: 'batchId',
            crimeDateTimeFrom: '01/01/2025 00:00',
            crimeDateTimeTo: '01/01/2025 00:00',
            crimeReference: 'crime1',
            overlayBodyTemplateId: 'overlay-body-crime-location',
            overlayTitleTemplateId: 'overlay-title-crime-location',
          },
        ],
        exportProximityAlertForm: {
          url: '/proximity-alert/78d41bd9-5450-4bbb-89d4-42ba75659f50/export-proximity-alert',
        },
      })
    })

    it('should present an export warning alert when one exists in session and clear it afterwards', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({ params: { crimeVersionId } })
      req.session.exportProximityAlertError = 'Invalid export request.'
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
        usesInternalOverlays: false,
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
          crimeTypeId: 'AB',
          crimeDateTimeFrom: '2025-01-01T00:00:00Z',
          crimeDateTimeTo: '2025-01-01T01:00:00Z',
          crimeText: 'text',
          latitude: 10.0,
          longitude: 10.0,
          matching: { deviceWearers: [] },
          versionLabel: 'Latest version',
          versionColour: 'green',
        },
        positions: [
          {
            latitude: 10,
            longitude: 10,
            positionType: 'crime',
            crimeTypeId: 'AB',
          },
        ],
        exportProximityAlertForm: {
          url: '/proximity-alert/78d41bd9-5450-4bbb-89d4-42ba75659f50/export-proximity-alert',
        },
      })
      expect(req.session.exportProximityAlertError).toBeUndefined()
    })
  })

  describe('exportProximityAlert', () => {
    it('should redirect back with a session error when the export request is invalid', async () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const req = createMockRequest({
        params: { crimeVersionId },
        body: {
          deviceIds: 123,
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
      expect(req.session.exportProximityAlertError).toEqual('Invalid export request.')
      expect(res.redirect).toHaveBeenCalledWith(`/proximity-alert/${crimeVersionId}`)
      expect(next).not.toHaveBeenCalled()
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
          deviceIds: ['1', '2'],
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
        image1Jpg: undefined,
        image2Jpg: undefined,
        wearerImage1JpgById: {},
        wearerImage2JpgById: {},
      }
      const docxBuffer = Buffer.from('fake-docx')

      mockRestClient.getCrimeVersion.mockResolvedValue({
        data: {
          crimeVersionId,
          crimeReference: 'crime1',
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
        body: {},
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
      expect(req.session.exportProximityAlertError).toEqual(
        'Select at least one device wearer to export the Proximity Alert report.',
      )
      expect(res.redirect).toHaveBeenCalledWith(`/proximity-alert/${crimeVersionId}`)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
