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
import PoliceDataDashboardController from './dashboard'
import CrimeMatchingResultsService from '../../services/crimeMatchingResultsService'

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

const ingestionAttemptSummary = {
  ingestionAttemptId: '1234',
  ingestionStatus: 'SUCCESSFUL',
  policeForceArea: 'METROPOLITAN',
  crimeBatchId: 'd3295103-b9d1-4525-b6c6-10ee16c6e36c',
  batchId: 'MPS20251110',
  matches: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const expectedIngestionAttemptSummary = {
  ingestionAttemptId: '1234',
  ingestionStatus: 'SUCCESSFUL',
  policeForceArea: 'Metropolitan',
  crimeBatchId: 'd3295103-b9d1-4525-b6c6-10ee16c6e36c',
  batchId: 'MPS20251110',
  matches: 0,
  matchesText: '0',
  statusColour: 'green',
  statusText: 'Ingested',
  createdAt: '2025-01-01T00:00:00.000Z',
  canBeExported: false,
}

describe('PoliceDataDashboardController', () => {
  let mockRestClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('search', () => {
    it.each([
      [{}, '/police-data/dashboard'],
      [{ policeForceArea: 'METROPOLITAN' }, '/police-data/dashboard?policeForceArea=METROPOLITAN'],
      [{ batchId: 'MPS20251110' }, '/police-data/dashboard?batchId=MPS20251110'],
      [{ fromDate: '01/1/2026' }, '/police-data/dashboard?fromDate=01%2F1%2F2026'],
      [{ toDate: '02/1/2026' }, '/police-data/dashboard?toDate=02%2F1%2F2026'],
      [
        { policeForceArea: 'METROPOLITAN', batchId: 'MPS20251110', fromDate: '01/1/2026', toDate: '02/1/2026' },
        '/police-data/dashboard?batchId=MPS20251110&policeForceArea=METROPOLITAN&fromDate=01%2F1%2F2026&toDate=02%2F1%2F2026',
      ],
    ])('should correctly redirect for body %o to %s', async (body, expected) => {
      // Given
      const req = createMockRequest({ body })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, expected)
      expect(next).not.toHaveBeenCalled()
    })

    it('should not include unknown fields in the redirect', async () => {
      // Given
      const req = createMockRequest({ body: { foo: 'bar' } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, '/police-data/dashboard')
      expect(next).not.toHaveBeenCalled()
    })

    it('should encode query parameters correctly', async () => {
      // Given
      const req = createMockRequest({ body: { batchId: 'A&B=C' } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, '/police-data/dashboard?batchId=A%26B%3DC')
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('view', () => {
    it.each([
      [{ policeForceArea: 'INVALID' }, { policeForceArea: 'Please select a valid police force area.' }],
      [{ fromDate: 'abc' }, { fromDate: 'Please enter a valid date.' }],
      [{ toDate: 'abc' }, { toDate: 'Please enter a valid date.' }],
      [
        {
          policeForceArea: 'INVALID',
          fromDate: 'abc',
          toDate: 'abc',
        },
        {
          policeForceArea: 'Please select a valid police force area.',
          fromDate: 'Please enter a valid date.',
          toDate: 'Please enter a valid date.',
        },
      ],
    ])(
      'should send validation errors to the view engine when the query contains invalid parameters %o',
      async (query, expectedValidationErrors) => {
        // Given
        const req = createMockRequest({ query })
        const res = createMockResponse()
        const next = jest.fn()
        const policeDataService = new PoliceDataService(mockRestClient)
        const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
        const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

        // When
        await controller.view(req, res, next)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/policeData/dashboard', {
          batchId: '',
          policeForceArea: '',
          fromDate: '',
          toDate: '',
          ...query,
          ingestionAttempts: [],
          pageCount: 1,
          pageNumber: 1,
          validationErrors: expectedValidationErrors,
        })
        expect(next).not.toHaveBeenCalled()
      },
    )

    it.each([
      [{ batchId: 'MPS20251110' }, ['MPS20251110', undefined, undefined, undefined], 'batchId=MPS20251110'],
      [
        { policeForceArea: 'METROPOLITAN' },
        [undefined, 'METROPOLITAN', undefined, undefined],
        'policeForceArea=METROPOLITAN',
      ],
      [{ fromDate: '01/01/2026' }, [undefined, undefined, '2026-01-01T00:00:00', undefined], 'fromDate=01%2F01%2F2026'],
      [{ toDate: '02/01/2026' }, [undefined, undefined, undefined, '2026-01-02T23:59:59'], 'toDate=02%2F01%2F2026'],
      [
        {
          batchId: 'MPS20251110',
          policeForceArea: 'METROPOLITAN',
          fromDate: '01/01/2026',
          toDate: '02/01/2026',
        },
        ['MPS20251110', 'METROPOLITAN', '2026-01-01T00:00:00', '2026-01-02T23:59:59'],
        'batchId=MPS20251110&policeForceArea=METROPOLITAN&fromDate=01%2F01%2F2026&toDate=02%2F01%2F2026',
      ],
    ])(
      'should query the api and send data to the view engine',
      async (query, expectedApiParams, expectedHrefPrefix) => {
        // Given
        const req = createMockRequest({ query })
        const res = createMockResponse()
        const next = jest.fn()
        const policeDataService = new PoliceDataService(mockRestClient)
        const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
        const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

        mockRestClient.getIngestionAttempts.mockResolvedValue({
          data: [ingestionAttemptSummary],
          pageCount: 1,
          pageNumber: 0,
          pageSize: 10,
        })

        // When
        await controller.view(req, res, next)

        // Then
        expect(mockRestClient.getIngestionAttempts).toHaveBeenCalledWith(
          expectedAuthOptions,
          ...expectedApiParams,
          undefined,
        )
        expect(res.render).toHaveBeenCalledWith('pages/policeData/dashboard', {
          batchId: '',
          policeForceArea: '',
          fromDate: '',
          toDate: '',
          ...query,
          ingestionAttempts: [expectedIngestionAttemptSummary],
          paginationHrefPrefix: expectedHrefPrefix,
          pageCount: 1,
          pageNumber: 1,
          validationErrors: {},
        })
        expect(next).not.toHaveBeenCalled()
      },
    )

    it('should not include the current page number in the pagination href prefix', async () => {
      // Given
      const pageNumber = 2
      const req = createMockRequest({ query: { page: pageNumber.toString() } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      mockRestClient.getIngestionAttempts.mockResolvedValue({
        data: [ingestionAttemptSummary],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempts).toHaveBeenCalledWith(
        expectedAuthOptions,
        undefined,
        undefined,
        undefined,
        undefined,
        (pageNumber - 1).toString(),
      )
      expect(res.render).toHaveBeenCalledWith('pages/policeData/dashboard', {
        batchId: '',
        policeForceArea: '',
        fromDate: '',
        toDate: '',
        ingestionAttempts: [expectedIngestionAttemptSummary],
        paginationHrefPrefix: '',
        pageCount: 1,
        pageNumber,
        validationErrors: {},
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should correctly present the different ingestion attempt states to the view engine', async () => {
      const req = createMockRequest({})
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      // Given
      mockRestClient.getIngestionAttempts.mockResolvedValue({
        data: [
          // Successful with matches
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'METROPOLITAN',
            crimeBatchId: '3acc50a6-ecc4-4c40-8296-3fc8409c1765',
            batchId: 'MPS20251110',
            matches: 5,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          // Successful without matches
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'METROPOLITAN',
            crimeBatchId: '4f493763-fd59-41a3-9f2d-688d6dbd82c8',
            batchId: 'MPS20251110',
            matches: 0,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          // Successful pending matching
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'METROPOLITAN',
            crimeBatchId: '5494b24b-5972-492e-b3a0-e215fe0a9fc0',
            batchId: 'MPS20251110',
            matches: null,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          // Partial with matches
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'PARTIAL',
            policeForceArea: 'AVON_AND_SOMERSET',
            crimeBatchId: 'a0fd61c2-c289-4acd-aef9-2d7d89a26d4f',
            batchId: 'MPS20251110',
            matches: 5,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          // Partial without matches
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'PARTIAL',
            policeForceArea: 'AVON_AND_SOMERSET',
            crimeBatchId: '21c9124b-d90b-4830-bf6e-5327a690bff4',
            batchId: 'MPS20251110',
            matches: 0,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          // Partial pending matching
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'PARTIAL',
            policeForceArea: 'AVON_AND_SOMERSET',
            crimeBatchId: '9ff5fdf8-5c8c-4e3b-bd6a-d0fe1407f0d8',
            batchId: 'MPS20251110',
            matches: null,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          // Failed
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'FAILED',
            policeForceArea: 'CITY_OF_LONDON',
            crimeBatchId: '6d869b08-7546-4ba7-8f26-2548f97f5a75',
            batchId: 'MPS20251110',
            matches: null,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          // Error
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'ERROR',
            policeForceArea: 'CITY_OF_LONDON',
            crimeBatchId: '',
            batchId: 'MPS20251110',
            matches: null,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ],
        pageCount: 1,
        pageNumber: 0,
        pageSize: 10,
      })

      // When
      await controller.view(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/policeData/dashboard', {
        batchId: '',
        policeForceArea: '',
        fromDate: '',
        toDate: '',
        ingestionAttempts: [
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'Metropolitan',
            crimeBatchId: '3acc50a6-ecc4-4c40-8296-3fc8409c1765',
            batchId: 'MPS20251110',
            matches: 5,
            matchesText: '5',
            statusText: 'Ingested',
            statusColour: 'green',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: true,
          },
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'Metropolitan',
            crimeBatchId: '4f493763-fd59-41a3-9f2d-688d6dbd82c8',
            batchId: 'MPS20251110',
            matches: 0,
            matchesText: '0',
            statusText: 'Ingested',
            statusColour: 'green',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: false,
          },
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'Metropolitan',
            crimeBatchId: '5494b24b-5972-492e-b3a0-e215fe0a9fc0',
            batchId: 'MPS20251110',
            matches: null,
            matchesText: 'In progress',
            statusColour: 'green',
            statusText: 'Ingested',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: false,
          },
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'PARTIAL',
            policeForceArea: 'Avon and Somerset',
            crimeBatchId: 'a0fd61c2-c289-4acd-aef9-2d7d89a26d4f',
            batchId: 'MPS20251110',
            matches: 5,
            matchesText: '5',
            statusColour: 'yellow',
            statusText: 'Partially ingested',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: true,
          },
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'PARTIAL',
            policeForceArea: 'Avon and Somerset',
            crimeBatchId: '21c9124b-d90b-4830-bf6e-5327a690bff4',
            batchId: 'MPS20251110',
            matches: 0,
            matchesText: '0',
            statusColour: 'yellow',
            statusText: 'Partially ingested',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: false,
          },
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'PARTIAL',
            policeForceArea: 'Avon and Somerset',
            crimeBatchId: '9ff5fdf8-5c8c-4e3b-bd6a-d0fe1407f0d8',
            batchId: 'MPS20251110',
            matches: null,
            matchesText: 'In progress',
            statusColour: 'yellow',
            statusText: 'Partially ingested',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: false,
          },
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'FAILED',
            policeForceArea: 'City of London',
            crimeBatchId: '6d869b08-7546-4ba7-8f26-2548f97f5a75',
            batchId: 'MPS20251110',
            matches: null,
            matchesText: 'N/A',
            statusColour: 'orange',
            statusText: 'Failed ingestion',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: false,
          },
          {
            ingestionAttemptId: '1234',
            ingestionStatus: 'ERROR',
            policeForceArea: 'City of London',
            crimeBatchId: '',
            batchId: 'MPS20251110',
            matches: null,
            matchesText: 'N/A',
            statusColour: 'red',
            statusText: 'Error',
            createdAt: '2025-01-01T00:00:00.000Z',
            canBeExported: false,
          },
        ],
        paginationHrefPrefix: '',
        pageCount: 1,
        pageNumber: 1,
        validationErrors: {},
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('export', () => {
    it('should export crime matching results', async () => {
      // Given
      const req = createMockRequest({
        query: { batchIds: ['bccfe61c-adb0-4e50-b6e6-ce7a68866773', '93fa3424-d014-49ac-ae11-e5bcc2c53c9d'] },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      mockRestClient.getCrimeMatchingResults.mockResolvedValue({
        data: [
          {
            policeForce: 'METROPOLITAN',
            batchId: 'MPS20260101',
            crimeRef: '01/12345/23',
            crimeType: 'BOTD',
            crimeDateTimeFrom: '2026-01-01T00:00:00.000Z',
            crimeDateTimeTo: '2026-01-01T01:00:00.000Z',
            crimeLatitude: 0.0,
            crimeLongitude: 0.0,
            crimeText: 'Description',
            deviceId: 1,
            deviceName: 'deviceName',
            subjectId: '123',
            subjectName: 'John Smith',
            subjectNomisId: 'nomisId',
            subjectPncRef: 'pncRef',
            subjectAddress: 'Street,City,Address',
            subjectDateOfBirth: '01/01/1970',
            subjectManager: '',
          },
        ],
      })

      // When
      await controller.export(req, res, next)

      // Then
      expect(mockRestClient.getCrimeMatchingResults).toHaveBeenCalledWith(expectedAuthOptions, [
        'bccfe61c-adb0-4e50-b6e6-ce7a68866773',
        '93fa3424-d014-49ac-ae11-e5bcc2c53c9d',
      ])
      expect(res.setHeader).toHaveBeenNthCalledWith(1, 'Content-Type', 'text/csv')
      expect(res.setHeader).toHaveBeenNthCalledWith(
        2,
        'Content-Disposition',
        'attachment; filename="crime-matching-results-20260101000000.csv"',
      )
      expect(res.send).toHaveBeenCalledWith(
        '"POLICE FORCE","BATCH ID","CRIME REF","CRIME TYPE","FROM DATE/TIME","TO DATE/TIME","CRIME LATITUDE","CRIME LONGITUDE","OTHER INFO","DEVICE ID","DEVICE NAME","SUBJECT IDENTIFIER","OFFENDER NAME","NOMIS ID","PNC REF","OFFENDER ADDRESS","OFFENDER DATE OF BIRTH","OFFENDER MANAGER"\n"METROPOLITAN","MPS20260101","01/12345/23","BOTD","01/01/2026 00:00","01/01/2026 01:00","0","0","Description","1","deviceName","123","John Smith","nomisId","pncRef","Street,City,Address","01/01/1970",""',
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should throw an error if no batches selected', async () => {
      // Given
      const req = createMockRequest({})
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      // When
      await controller.export(req, res, next)

      // Then
      expect(mockRestClient.getCrimeMatchingResults).not.toHaveBeenCalled()
      expect(res.setHeader).not.toHaveBeenCalled()
      expect(res.send).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(new Error('At least one batch must be selected for export.'))
    })

    it('should throw an error if no data returned by API', async () => {
      // Given
      const req = createMockRequest({ query: { batchIds: ['bccfe61c-adb0-4e50-b6e6-ce7a68866773'] } })
      const res = createMockResponse()
      const next = jest.fn()
      const policeDataService = new PoliceDataService(mockRestClient)
      const crimeMatchingResultService = new CrimeMatchingResultsService(mockRestClient)
      const controller = new PoliceDataDashboardController(policeDataService, crimeMatchingResultService)

      mockRestClient.getCrimeMatchingResults.mockResolvedValue({
        data: [],
      })

      // When
      await controller.export(req, res, next)

      // Then
      expect(mockRestClient.getCrimeMatchingResults).toHaveBeenCalledWith(expectedAuthOptions, [
        'bccfe61c-adb0-4e50-b6e6-ce7a68866773',
      ])
      expect(res.setHeader).not.toHaveBeenCalled()
      expect(res.send).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(new Error('No results'))
    })
  })
})
