import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import logger from '../../../logger'
import ZeroPrecisionCrimeMatches from './zeroPrecisionCrimeMatches'
import CrimeMatchingClient from '../../data/crimeMatchingClient'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

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
        from: '2026-11-01T00:00:00.000Z',
        to: '2026-11-08T00:00:00.000Z',
      })

      // Then the client is called with the correct authentication and filters
      expect(mockRestClient.getZeroPrecisionCrimeMatchesDataset).toHaveBeenCalledWith(
        asSystem('test-user'),
        '2026-11-01T00:00:00.000Z',
        '2026-11-08T00:00:00.000Z',
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

  describe('defaultQuery', () => {
    it('defaults to the current UK date', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-07-01T23:30:00Z'))

      try {
        const dataset = new ZeroPrecisionCrimeMatches(mockRestClient)

        expect(dataset.defaultQuery()).toEqual({
          from: '02/07/2026',
          to: '02/07/2026',
        })
      } finally {
        jest.useRealTimers()
      }
    })
  })
})
