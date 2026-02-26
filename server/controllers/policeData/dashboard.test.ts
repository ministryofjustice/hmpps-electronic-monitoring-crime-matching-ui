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
  batchId: 'MPS20251110',
  matches: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const expectedIngestionAttemptSummary = {
  ingestionAttemptId: '1234',
  ingestionStatus: 'SUCCESSFUL',
  policeForceArea: 'Metropolitan',
  batchId: 'MPS20251110',
  matches: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
}

describe('PoliceDataDashboardController', () => {
  let mockRestClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
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
      const service = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataDashboardController(service)

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
      const service = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataDashboardController(service)

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
      const service = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataDashboardController(service)

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
        const service = new PoliceDataService(mockRestClient)
        const controller = new PoliceDataDashboardController(service)

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
      [{ batchId: 'MPS20251110' }, ['MPS20251110', '', '', '']],
      [{ policeForceArea: 'METROPOLITAN' }, ['', 'METROPOLITAN', '', '']],
      [{ fromDate: '01/01/2026' }, ['', '', '2026-01-01T00:00:00.000Z', '']],
      [{ toDate: '02/01/2026' }, ['', '', '', '2026-01-02T00:00:00.000Z']],
      [
        {
          batchId: 'MPS20251110',
          policeForceArea: 'METROPOLITAN',
          fromDate: '01/01/2026',
          toDate: '02/01/2026',
        },
        ['MPS20251110', 'METROPOLITAN', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'],
      ],
    ])('should query the api and send data to the view engine', async (query, expectedApiParams) => {
      // Given
      const req = createMockRequest({ query })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PoliceDataService(mockRestClient)
      const controller = new PoliceDataDashboardController(service)

      mockRestClient.getIngestionAttempts.mockResolvedValue({
        data: [ingestionAttemptSummary],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getIngestionAttempts).toHaveBeenCalledWith(expectedAuthOptions, ...expectedApiParams)
      expect(res.render).toHaveBeenCalledWith('pages/policeData/dashboard', {
        batchId: '',
        policeForceArea: '',
        fromDate: '',
        toDate: '',
        ...query,
        ingestionAttempts: [expectedIngestionAttemptSummary],
        pageCount: 1,
        pageNumber: 1,
        validationErrors: {},
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})
