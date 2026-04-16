import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import logger from '../../../logger'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import PoliceDataService from '../../services/policeDataService'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import PoliceDataIngestionAttemptController from './ingestionAttempt'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

const expectedAuthOptions = {
  tokenType: 'SYSTEM_TOKEN',
  user: {
    username: 'fakeUserName',
  },
}

describe('PoliceDataIngestionAttemptController', () => {
  let mockRestClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('view', () => {
    it('should correctly present a successful ingestion awaiting matching to the view engine', async () => {
      // Given
      const ingestionAttemptId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'
      const req = createMockRequest({ params: { ingestionAttemptId } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataIngestionAttemptController(policeDataService)

      mockRestClient.getIngestionAttempt.mockResolvedValue({
        data: {
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'SUCCESSFUL',
          policeForceArea: 'CUMBRIA',
          crimeBatchId: '4aba17e8-3cc1-4b3d-8be4-b7e5c0d6b15d',
          batchId: 'CMB20250710',
          matches: null,
          createdAt: '2026-03-17T11:33:38.483121',
          fileName: '20260101000000.csv',
          submitted: 2,
          successful: 2,
          failed: 0,
          crimesByCrimeType: [{ crimeType: 'BIAD', submitted: 2, failed: 0, successful: 2 }],
          validationErrors: [],
        },
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempt).toHaveBeenCalledWith(expectedAuthOptions, ingestionAttemptId)
      expect(res.render).toHaveBeenCalledWith('pages/policeData/ingestionAttempt', {
        ingestionAttempt: {
          batchId: 'CMB20250710',
          createdAt: '2026-03-17T11:33:38.483121',
          failed: 0,
          fileName: '20260101000000.csv',
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'SUCCESSFUL',
          ingestionStatusColour: 'green',
          ingestionStatusText: 'Ingested',
          matches: null,
          matchesText: 'In progress',
          policeForceArea: 'Cumbria',
          submitted: 2,
          successful: 2,
          displayCrimeBreakdown: true,
          displayValidationErrors: false,
          crimesByCrimeType: {
            AB: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            BIAD: {
              crimeType: 'BIAD',
              failed: 0,
              submitted: 2,
              successful: 2,
            },
            BOTD: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            MISSING: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            RB: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TFMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TFP: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TOMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
          },
          validationErrors: [],
        },
      })
    })

    it('should correctly present a successful ingestion with matches to the view engine', async () => {
      // Given
      const ingestionAttemptId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'
      const req = createMockRequest({ params: { ingestionAttemptId } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataIngestionAttemptController(policeDataService)

      mockRestClient.getIngestionAttempt.mockResolvedValue({
        data: {
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'SUCCESSFUL',
          policeForceArea: 'CUMBRIA',
          crimeBatchId: '4aba17e8-3cc1-4b3d-8be4-b7e5c0d6b15d',
          batchId: 'CMB20250710',
          matches: 2,
          createdAt: '2026-03-17T11:33:38.483121',
          fileName: '20260101000000.csv',
          submitted: 2,
          successful: 2,
          failed: 0,
          crimesByCrimeType: [{ crimeType: 'RB', submitted: 2, failed: 0, successful: 2 }],
          validationErrors: [],
        },
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempt).toHaveBeenCalledWith(expectedAuthOptions, ingestionAttemptId)
      expect(res.render).toHaveBeenCalledWith('pages/policeData/ingestionAttempt', {
        ingestionAttempt: {
          batchId: 'CMB20250710',
          createdAt: '2026-03-17T11:33:38.483121',
          failed: 0,
          fileName: '20260101000000.csv',
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'SUCCESSFUL',
          ingestionStatusColour: 'green',
          ingestionStatusText: 'Ingested',
          matches: 2,
          matchesText: '2',
          policeForceArea: 'Cumbria',
          submitted: 2,
          successful: 2,
          displayCrimeBreakdown: true,
          displayValidationErrors: false,
          crimesByCrimeType: {
            AB: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            BIAD: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            BOTD: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            MISSING: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            RB: {
              crimeType: 'RB',
              failed: 0,
              submitted: 2,
              successful: 2,
            },
            TFMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TFP: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TOMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
          },
          validationErrors: [],
        },
      })
    })

    it('should correctly present a partial ingestion to the view engine', async () => {
      // Given
      const ingestionAttemptId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'
      const req = createMockRequest({ params: { ingestionAttemptId } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataIngestionAttemptController(policeDataService)

      mockRestClient.getIngestionAttempt.mockResolvedValue({
        data: {
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'PARTIAL',
          policeForceArea: 'NORTH_WALES',
          batchId: 'CMB20250710',
          matches: null,
          createdAt: '2026-03-17T11:33:38.483121',
          fileName: '20260101000000.csv',
          submitted: 101,
          successful: 100,
          failed: 1,
          crimesByCrimeType: [
            { crimeType: 'BIAD', submitted: 13, failed: 0, successful: 13 },
            { crimeType: 'RB', submitted: 17, failed: 0, successful: 17 },
            { crimeType: 'TOMV', submitted: 20, failed: 0, successful: 20 },
            { crimeType: 'TFP', submitted: 12, failed: 0, successful: 12 },
            { crimeType: 'TFMV', submitted: 12, failed: 0, successful: 12 },
            { crimeType: 'AB', submitted: 13, failed: 0, successful: 13 },
            { crimeType: 'BOTD', submitted: 13, failed: 0, successful: 13 },
            { crimeType: 'MISSING', submitted: 1, failed: 1, successful: 0 },
          ],
          validationErrors: [
            {
              crimeReference: 'CR123456',
              errorType: 'Field must be a valid ENUM value',
              requiredAction: 'Amend crime type to a registered crime type',
            },
          ],
        },
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempt).toHaveBeenCalledWith(expectedAuthOptions, ingestionAttemptId)
      expect(res.render).toHaveBeenCalledWith('pages/policeData/ingestionAttempt', {
        ingestionAttempt: {
          batchId: 'CMB20250710',
          createdAt: '2026-03-17T11:33:38.483121',
          fileName: '20260101000000.csv',
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'PARTIAL',
          ingestionStatusColour: 'yellow',
          ingestionStatusText: 'Partially ingested',
          matches: null,
          matchesText: 'In progress',
          policeForceArea: 'North Wales',
          submitted: 101,
          successful: 100,
          failed: 1,
          displayCrimeBreakdown: true,
          displayValidationErrors: true,
          crimesByCrimeType: {
            AB: {
              crimeType: 'AB',
              failed: 0,
              submitted: 13,
              successful: 13,
            },
            BIAD: {
              crimeType: 'BIAD',
              failed: 0,
              submitted: 13,
              successful: 13,
            },
            BOTD: {
              crimeType: 'BOTD',
              failed: 0,
              submitted: 13,
              successful: 13,
            },
            MISSING: {
              crimeType: 'MISSING',
              failed: 1,
              submitted: 1,
              successful: 0,
            },
            RB: {
              crimeType: 'RB',
              failed: 0,
              submitted: 17,
              successful: 17,
            },
            TFMV: {
              crimeType: 'TFMV',
              failed: 0,
              submitted: 12,
              successful: 12,
            },
            TFP: {
              crimeType: 'TFP',
              failed: 0,
              submitted: 12,
              successful: 12,
            },
            TOMV: {
              crimeType: 'TOMV',
              failed: 0,
              submitted: 20,
              successful: 20,
            },
          },
          validationErrors: [
            {
              crimeReference: 'CR123456',
              errorType: 'Field must be a valid ENUM value',
              requiredAction: 'Amend crime type to a registered crime type',
            },
          ],
        },
      })
    })

    it('should correctly present a failed ingestion to the view engine', async () => {
      // Given
      const ingestionAttemptId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'
      const req = createMockRequest({ params: { ingestionAttemptId } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataIngestionAttemptController(policeDataService)

      mockRestClient.getIngestionAttempt.mockResolvedValue({
        data: {
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'FAILED',
          policeForceArea: '',
          crimeBatchId: '',
          batchId: '',
          matches: null,
          createdAt: '2026-03-17T11:33:38.483049',
          fileName: null,
          submitted: 0,
          successful: 0,
          failed: 0,
          crimesByCrimeType: [],
          validationErrors: [],
        },
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempt).toHaveBeenCalledWith(expectedAuthOptions, ingestionAttemptId)
      expect(res.render).toHaveBeenCalledWith('pages/policeData/ingestionAttempt', {
        ingestionAttempt: {
          batchId: 'Failed',
          createdAt: '2026-03-17T11:33:38.483049',
          failed: 0,
          fileName: 'N/A',
          ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
          ingestionStatus: 'FAILED',
          ingestionStatusColour: 'orange',
          ingestionStatusText: 'Failed ingestion',
          matches: null,
          matchesText: 'N/A',
          policeForceArea: 'N/A',
          submitted: 0,
          successful: 0,
          displayCrimeBreakdown: false,
          displayValidationErrors: false,
          crimesByCrimeType: {
            AB: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            BIAD: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            BOTD: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            MISSING: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            RB: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TFMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TFP: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TOMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
          },
          validationErrors: [],
        },
      })
    })

    it('should correctly present an errored ingestion to the view engine', async () => {
      // Given
      const ingestionAttemptId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'
      const req = createMockRequest({ params: { ingestionAttemptId } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataIngestionAttemptController(policeDataService)

      mockRestClient.getIngestionAttempt.mockResolvedValue({
        data: {
          ingestionAttemptId: '904a7328-0817-449e-9124-7360c446d8ae',
          ingestionStatus: 'ERROR',
          policeForceArea: '',
          crimeBatchId: '',
          batchId: '',
          matches: null,
          createdAt: '2026-03-17T11:33:38.483028',
          fileName: '20260101000000.csv',
          submitted: 1,
          successful: 0,
          failed: 1,
          crimesByCrimeType: [{ crimeType: 'RB', submitted: 1, failed: 1, successful: 0 }],
          validationErrors: [
            {
              crimeReference: 'CR123456',
              errorType: 'Field must be a valid ENUM value',
              requiredAction: 'Amend crime type to a registered crime type',
            },
          ],
        },
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempt).toHaveBeenCalledWith(expectedAuthOptions, ingestionAttemptId)
      expect(res.render).toHaveBeenCalledWith('pages/policeData/ingestionAttempt', {
        ingestionAttempt: {
          batchId: 'Failed',
          createdAt: '2026-03-17T11:33:38.483028',
          failed: 1,
          fileName: '20260101000000.csv',
          ingestionAttemptId: '904a7328-0817-449e-9124-7360c446d8ae',
          ingestionStatus: 'ERROR',
          ingestionStatusColour: 'red',
          ingestionStatusText: 'Error',
          matches: null,
          matchesText: 'N/A',
          policeForceArea: 'N/A',
          submitted: 1,
          successful: 0,
          displayCrimeBreakdown: true,
          displayValidationErrors: true,
          crimesByCrimeType: {
            AB: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            BIAD: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            BOTD: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            MISSING: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            RB: {
              crimeType: 'RB',
              failed: 1,
              submitted: 1,
              successful: 0,
            },
            TFMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TFP: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
            TOMV: {
              failed: 0,
              submitted: 0,
              successful: 0,
            },
          },
          validationErrors: [
            {
              crimeReference: 'CR123456',
              errorType: 'Field must be a valid ENUM value',
              requiredAction: 'Amend crime type to a registered crime type',
            },
          ],
        },
      })
    })
  })

  describe('export', () => {
    it('should export validation errors', async () => {
      // Given
      const ingestionAttemptId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'
      const req = createMockRequest({ params: { ingestionAttemptId } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataIngestionAttemptController(policeDataService)

      mockRestClient.getIngestionAttempt.mockResolvedValue({
        data: {
          ingestionAttemptId: '904a7328-0817-449e-9124-7360c446d8ae',
          ingestionStatus: 'ERROR',
          policeForceArea: '',
          crimeBatchId: '',
          batchId: 'CMB20250710',
          matches: null,
          createdAt: '2026-03-17T11:33:38.483028',
          fileName: '20260101000000.csv',
          submitted: 1,
          successful: 0,
          failed: 1,
          crimesByCrimeType: [{ crimeType: 'RB', submitted: 1, failed: 1, successful: 0 }],
          validationErrors: [
            {
              crimeReference: 'CR123456',
              errorType: 'Field must be a valid ENUM value',
              requiredAction: 'Amend crime type to a registered crime type',
            },
          ],
        },
      })

      // When
      await controller.export(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempt).toHaveBeenCalledWith(expectedAuthOptions, ingestionAttemptId)
      expect(res.setHeader).toHaveBeenNthCalledWith(1, 'Content-Type', 'text/csv')
      expect(res.setHeader).toHaveBeenNthCalledWith(
        2,
        'Content-Disposition',
        'attachment; filename="validation-errors-CMB20250710.csv"',
      )
      expect(res.send).toHaveBeenCalledWith(
        '"Crime reference","Error type","Required action"\n"CR123456","Field must be a valid ENUM value","Amend crime type to a registered crime type"',
      )
      expect(next).not.toHaveBeenCalled()
    })
  })
})
