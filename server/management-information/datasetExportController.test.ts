import createMockDataset from '../testutils/createMockDataset'
import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import DatasetRegistry from './datasetRegistry'
import DatasetExportController from './datasetExportController'

describe('DatasetExportController', () => {
  describe('export', () => {
    it('downloads the complete dataset without pagination as a csv', async () => {
      // Given a request for the first dataset
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '01/10/2026',
          to: '31/10/2026',
          page: '3',
          format: 'csv',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset registered with the same ID
      const dataset = createMockDataset('first', {
        filters: ['from', 'to'],
      })
      const controller = new DatasetExportController(new DatasetRegistry([dataset]))

      // When the dataset is downloaded
      await controller.export(req, res, next)

      // Then the dataset is retrieved without pagination
      expect(dataset.retrieve).toHaveBeenCalledWith('fakeUserName', {
        from: '2026-10-01T00:00:00.000Z',
        to: '2026-11-01T00:00:00.000Z',
      })

      // And the CSV is returned as an attachment
      expect(res.attachment).toHaveBeenCalledWith(expect.stringMatching(/^first-\d{4}-\d{2}-\d{2}\.csv$/))
      expect(res.type).toHaveBeenCalledWith('text/csv')
      expect(res.send).toHaveBeenCalledWith('Police force,Matched crimes\nMetropolitan,100\n')
    })

    it('returns 404 when the dataset does not exist', async () => {
      // Given a request for an unknown dataset
      const req = createMockRequest({
        params: { id: 'unknown' },
        query: {
          format: 'csv',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And no dataset is registered under the requested ID
      const registry = new DatasetRegistry()
      const controller = new DatasetExportController(registry)

      // When the dataset is downloaded
      await controller.export(req, res, next)

      // Then a 404 error is returned via the next middleware
      expect(next).toHaveBeenCalled()
      expect(res.send).not.toHaveBeenCalled()
    })

    it('returns 400 when the filters are invalid', async () => {
      // Given a request for the first dataset with an invalid filter
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '31/02/2026',
          format: 'csv',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset registered with the same ID
      const dataset = createMockDataset('first', {
        filters: ['from'],
      })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetExportController(registry)

      // When the dataset is downloaded
      await controller.export(req, res, next)

      // Then the dataset is not retrieved and a 400 status is returned
      expect(dataset.retrieve).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }))
      expect(res.send).not.toHaveBeenCalled()
    })

    it('downloads an empty dataset containing only column headings as a csv', async () => {
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          format: 'csv',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that returns no values
      const retrieve = jest.fn().mockResolvedValue({
        rows: [],
        pagination: {
          pageCount: 0,
          pageNumber: 0,
          pageSize: 0,
        },
      })
      const dataset = createMockDataset('first', { retrieve })
      const controller = new DatasetExportController(new DatasetRegistry([dataset]))

      // When the dataset is downloaded
      await controller.export(req, res, next)

      // Then the response contains only the column headings
      expect(res.send).toHaveBeenCalledWith('Police force,Matched crimes\n')
    })

    it('downloads the complete dataset without pagination as a tsv', async () => {
      // Given a request for the first dataset
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '01/10/2026',
          to: '31/10/2026',
          page: '3',
          format: 'tsv',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset registered with the same ID
      const dataset = createMockDataset('first', {
        filters: ['from', 'to'],
      })
      const controller = new DatasetExportController(new DatasetRegistry([dataset]))

      // When the dataset is downloaded
      await controller.export(req, res, next)

      // Then the dataset is retrieved without pagination
      expect(dataset.retrieve).toHaveBeenCalledWith('fakeUserName', {
        from: '2026-10-01T00:00:00.000Z',
        to: '2026-11-01T00:00:00.000Z',
      })

      // And the TSV is returned
      expect(res.attachment).not.toHaveBeenCalled()
      expect(res.type).toHaveBeenCalledWith('text/tab-separated-values')
      expect(res.send).toHaveBeenCalledWith('Police force\tMatched crimes\nMetropolitan\t100\n')
    })

    it('returns 400 when the format is missing', async () => {
      // Given a request for the first dataset with an invalid format
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '31/02/2026',
          format: '',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset registered with the same ID
      const dataset = createMockDataset('first', {
        filters: ['from'],
      })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetExportController(registry)

      // When the dataset is downloaded
      await controller.export(req, res, next)

      // Then the dataset is not retrieved and a 400 status is returned
      expect(dataset.retrieve).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }))
      expect(res.send).not.toHaveBeenCalled()
    })

    it('downloads an empty dataset containing only column headings as a tsv', async () => {
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          format: 'tsv',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that returns no values
      const retrieve = jest.fn().mockResolvedValue({
        rows: [],
        pagination: {
          pageCount: 0,
          pageNumber: 0,
          pageSize: 0,
        },
      })
      const dataset = createMockDataset('first', { retrieve })
      const controller = new DatasetExportController(new DatasetRegistry([dataset]))

      // When the dataset is downloaded
      await controller.export(req, res, next)

      // Then the response contains only the column headings
      expect(res.send).toHaveBeenCalledWith('Police force\tMatched crimes\n')
    })
  })
})
