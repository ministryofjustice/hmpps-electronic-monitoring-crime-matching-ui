import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import logger from '../../../logger'
import FailedCrimeSubmissions from './failedCrimeSubmissions'

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

describe('FailedCrimeSubmissions', () => {
  let mockRestClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
  })

  const createResponse = (data: unknown[] = []) => ({
    data,
    pageCount: 1,
    pageNumber: 1,
    pageSize: 10,
  })

  const failedCrimeSubmissions = {
    total: 2,
    failures: [
      { reasonForFailure: 'Invalid Batch ID format', failureCount: 2 },
      { reasonForFailure: 'Invalid date in Batch ID', failureCount: 0 },
    ],
  }

  const failedCrimeSubmissionsResponse = [
    { reasonForFailure: 'Invalid Batch ID format', failureCount: 2 },
    { reasonForFailure: 'Invalid date in Batch ID', failureCount: 0 },
    { reasonForFailure: 'Total', failureCount: 2 },
  ]

  describe('retrieve', () => {
    it('retrieves data with filters', async () => {
      const dataset = new FailedCrimeSubmissions(mockRestClient)

      // Given a client returning a valid response
      mockRestClient.getDataset.mockResolvedValue(createResponse([failedCrimeSubmissions]))

      // When the dataset is retrieved
      const result = await dataset.retrieve('test-user', {
        policeForceArea: 'METROPOLITAN',
        from: '2026-11-01T00:00:00.000Z',
        to: '2026-11-08T00:00:00.000Z',
        page: 0,
      })

      // Then the client is called with the correct authentication and filters
      expect(mockRestClient.getDataset).toHaveBeenCalledWith(asSystem('test-user'), 'failed-crime-submissions', {
        policeForceArea: 'METROPOLITAN',
        from: '2026-11-01T00:00:00.000Z',
        to: '2026-11-08T00:00:00.000Z',
        page: 0,
      })

      // And the validated records are returned
      expect(result).toEqual({
        rows: failedCrimeSubmissionsResponse,
        pagination: {
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })
    })

    it('retrieves data without filters', async () => {
      const dataset = new FailedCrimeSubmissions(mockRestClient)

      // Given a client returning a valid response
      mockRestClient.getDataset.mockResolvedValue(createResponse([failedCrimeSubmissions]))

      // When the dataset is retrieved
      await dataset.retrieve('test-user', {
        page: 0,
      })

      // Then the client is called without any filters
      expect(mockRestClient.getDataset).toHaveBeenCalledWith(asSystem('test-user'), 'failed-crime-submissions', {
        page: 0,
      })
    })

    it('retrieves all records when no page is specified', async () => {
      const dataset = new FailedCrimeSubmissions(mockRestClient)

      mockRestClient.getDataset.mockResolvedValue(createResponse([failedCrimeSubmissions]))

      await dataset.retrieve('test-user', {})

      expect(mockRestClient.getDataset).toHaveBeenCalledWith(asSystem('test-user'), 'failed-crime-submissions', {})
    })

    it('returns an empty dataset when no records are found', async () => {
      const dataset = new FailedCrimeSubmissions(mockRestClient)

      mockRestClient.getDataset.mockResolvedValue(createResponse([]))

      const result = await dataset.retrieve('test-user', {})

      expect(result).toEqual({
        rows: [],
        pagination: {
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })
    })

    it('rejects an invalid API response structure', async () => {
      const dataset = new FailedCrimeSubmissions(mockRestClient)

      // Given a client returning an invalid response structure
      mockRestClient.getDataset.mockResolvedValue({
        data: 'invalid',
      })

      // When the dataset is retrieved, it should throw an error
      await expect(dataset.retrieve('test-user', {})).rejects.toThrow()
    })
  })

  describe('defaultQuery', () => {
    it('defaults to the previous month', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-07-01T23:30:00Z'))

      try {
        const dataset = new FailedCrimeSubmissions(mockRestClient)

        expect(dataset.defaultQuery()).toEqual({
          from: '01/06/2026',
          to: '30/06/2026',
        })
      } finally {
        jest.useRealTimers()
      }
    })
  })
})
