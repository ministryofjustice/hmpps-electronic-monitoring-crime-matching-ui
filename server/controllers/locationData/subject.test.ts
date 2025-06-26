import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import createMockLogger from '../../testutils/createMockLogger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import SubjectService from '../../services/locationData/subject'
import SubjectController from './subject'

dayjs.extend(utc)
dayjs.extend(timezone)

jest.mock('@ministryofjustice/hmpps-rest-client')

describe('SubjectController', () => {
  let logger: jest.Mocked<Logger>
  let mockRestClient: jest.Mocked<RestClient>

  beforeEach(() => {
    logger = createMockLogger()
    mockRestClient = new RestClient(
      'crimeMatchingApi',
      {
        url: '',
        timeout: { response: 0, deadline: 0 },
        agent: { timeout: 0 },
      },
      logger,
    ) as jest.Mocked<RestClient>
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

      const orderStartDate = '2025-01-01T02:00:00.000Z'

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate,
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).toHaveBeenCalledWith(
        {
          data: {
            personId: '1',
            fromDate: '2025-02-01T01:01:01.000Z',
            toDate: '2025-02-02T01:01:01.000Z',
          },
          path: '/subject/location-query',
        },
        undefined,
      )
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subject?queryId=1234')
    })

    it('should redirect to a view containing a validation error message if no input dates provided', async () => {
      // Given
      const emptyDateInput = {
        date: '',
        hour: '',
        minute: '',
        second: '',
      }

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: emptyDateInput,
          toDate: emptyDateInput,
          orderStartDate: '2025-01-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
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

    it('should redirect to a view containing a validation error message if to input date before from input date', async () => {
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
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate: '2025-01-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'To date must be after From date',
        },
      ])
    })

    it('should redirect to a view containing a validation error message if dates exceed maximum window', async () => {
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
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate: '2025-01-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'Date and time search window should not exceed 48 hours',
        },
      ])
    })

    it('should redirect to a view containing a validation error message if input dates are outside of order date range', async () => {
      // Given
      const fromDateInput = {
        date: '1/1/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const toDateInput = {
        date: '1/1/2025',
        hour: '1',
        minute: '1',
        second: '1',
      }

      const req = createMockRequest({
        body: {
          personId: '1',
          fromDate: fromDateInput,
          toDate: toDateInput,
          orderStartDate: '2025-02-01T02:00:00.000Z',
          orderEndDate: null,
        },
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new SubjectService(mockRestClient)
      const controller = new SubjectController(service)

      mockRestClient.post.mockResolvedValue({
        queryExecutionId: '1234',
      })

      // When
      await controller.search(req, res, next)

      // Then
      expect(mockRestClient.post).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/location-data/subjects')
      expect(req.session.validationErrors).toEqual([
        {
          field: 'fromDate',
          message: 'Date and time search window should be within Order date range',
        },
      ])
    })
  })
})
