import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import ZeroPrecisionCrimeMatches from './zeroPrecisionCrimeMatches'
import logger from '../../../logger'

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

describe('ZeroPrecisionCrimeMatches', () => {
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

  const crimeMatch = {
    policeForceArea: 'MET',
    batchId: 'MET20261107',
    crimeReference: 'CRIME-001',
    deviceSerialNumber: 'DEVICE-001',
    matchedAt: '2026-11-07T10:30:00Z',
    zeroPrecisionPositionCount: 3,
  }

  describe('retrieve', () => {
    it('retrieves data with date filters', async () => {
      const dataset = new ZeroPrecisionCrimeMatches(mockRestClient)

      // Given a client returning a valid response
      mockRestClient.getZeroPrecisionCrimeMatchesDataset.mockResolvedValue(createResponse([crimeMatch]))

      // When the dataset is retrieved
      const result = await dataset.retrieve('test-user', {
        from: '2026-11-01',
        to: '2026-11-07',
      })

      // Then the client is called with the correct authentication and filters
      expect(mockRestClient.getZeroPrecisionCrimeMatchesDataset).toHaveBeenCalledWith(
        asSystem('test-user'),
        '2026-11-01',
        '2026-11-07',
      )

      // And the validated records are returned
      expect(result).toEqual({
        rows: [crimeMatch],
      })
    })

    it('retrieves data without date filters', async () => {
      const dataset = new ZeroPrecisionCrimeMatches(mockRestClient)

      // Given a client returning a valid response
      mockRestClient.getZeroPrecisionCrimeMatchesDataset.mockResolvedValue(createResponse([crimeMatch]))

      // When the dataset is retrieved
      await dataset.retrieve('test-user', {})

      // Then the client is called without date filters
      expect(mockRestClient.getZeroPrecisionCrimeMatchesDataset).toHaveBeenCalledWith(
        asSystem('test-user'),
        undefined,
        undefined,
      )
    })

    it('returns an empty dataset when no matches are found', async () => {
      const dataset = new ZeroPrecisionCrimeMatches(mockRestClient)

      // Given a client returning an empty response
      mockRestClient.getZeroPrecisionCrimeMatchesDataset.mockResolvedValue(createResponse())

      // When the dataset is retrieved
      const result = await dataset.retrieve('test-user', {})

      // Then the result contains no rows
      expect(result).toEqual({
        rows: [],
      })
    })

    it('rejects an invalid API response structure', async () => {
      const dataset = new ZeroPrecisionCrimeMatches(mockRestClient)

      // Given a client returning an invalid response structure
      mockRestClient.getZeroPrecisionCrimeMatchesDataset.mockResolvedValue({
        data: 'invalid',
      })

      // When the dataset is retrieved, it should throw an error
      await expect(dataset.retrieve('test-user', {})).rejects.toThrow()
    })
  })
})
