import createMockDataset from '../testutils/createMockDataset'
import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import DatasetRegistry from './datasetRegistry'
import DatasetController from './datasetController'

describe('DatasetController', () => {
  describe('view', () => {
    it('renders the requested dataset', async () => {
      // Given a request for the 'first' dataset
      const req = createMockRequest({
        params: { id: 'first' },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset registered under the same ID
      const dataset = createMockDataset('first')
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      await controller.view(req, res, next)

      // Then the response should render the dataset page with the dataset
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        table: undefined,
        validationErrors: undefined,
        from: '',
        to: '',
        policeForceArea: '',
      })

      // And it does not retrieve data when the page is first opened
      expect(dataset.retrieve).not.toHaveBeenCalled()
    })

    it('renders the requested dataset with default parameters if no query is provided', async () => {
      // Given a request for the 'first' dataset
      const req = createMockRequest({
        params: { id: 'first' },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset registered under the same ID with a default query
      const dataset = createMockDataset('first', {
        defaultQuery: () => ({ from: '01/01/2026', to: '01/01/2026', policeForceArea: 'METROPOLITAN' }),
      })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      await controller.view(req, res, next)

      // Then the response should render the dataset page with the dataset
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        table: undefined,
        validationErrors: undefined,
        from: '01/01/2026',
        to: '01/01/2026',
        policeForceArea: 'METROPOLITAN',
      })

      // And it does not retrieve data when the page is first opened
      expect(dataset.retrieve).not.toHaveBeenCalled()
    })

    it('renders the dataset with valid query parameters', async () => {
      // Given a request for the 'first' dataset with valid query parameters
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '01/10/2026',
          to: '31/10/2026',
          view: 'true',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that includes the 'from' and 'to' filters
      const dataset = createMockDataset('first', {
        defaultQuery: () => ({ from: '01/01/2026', to: '01/01/2026' }),
        filters: ['from', 'to'],
      })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      await controller.view(req, res, next)

      // Then the response should render the submitted query params with no errors
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        validationErrors: undefined,
        from: '01/10/2026',
        to: '31/10/2026',
        policeForceArea: '',
        table: {
          columns: [{ text: 'Police force' }, { text: 'Matched crimes' }],
          rows: [[{ text: 'Metropolitan' }, { text: '100' }]],
          pagination: {
            currentPage: 1,
            hrefPrefix: '?from=01%2F10%2F2026&to=31%2F10%2F2026&view=true',
            pageCount: 1,
          },
        },
        downloadUrl: '/management-information/first/download?from=01%2F10%2F2026&to=31%2F10%2F2026',
      })

      // And it retrieves data when valid query parameters are provided
      expect(dataset.retrieve).toHaveBeenCalledWith('fakeUserName', {
        from: '2026-10-01T00:00:00.000Z',
        to: '2026-11-01T00:00:00.000Z',
        page: 0,
      })
    })

    it('does not override empty query parameters with default values', async () => {
      // Given a request for the 'first' dataset with valid query parameters
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '',
          to: '',
          view: 'true',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that includes the a default query
      const dataset = createMockDataset('first', {
        defaultQuery: () => ({ from: '01/01/2026', to: '01/01/2026' }),
        filters: ['from', 'to'],
      })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      await controller.view(req, res, next)

      // Then the response should render the submitted query params with no errors
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        validationErrors: undefined,
        from: '',
        to: '',
        policeForceArea: '',
        table: {
          columns: [{ text: 'Police force' }, { text: 'Matched crimes' }],
          rows: [[{ text: 'Metropolitan' }, { text: '100' }]],
          pagination: {
            currentPage: 1,
            hrefPrefix: '?from=&to=&view=true',
            pageCount: 1,
          },
        },
        downloadUrl: '/management-information/first/download?from=&to=',
      })

      // And it retrieves data without default values for empty query parameters
      expect(dataset.retrieve).toHaveBeenCalledWith('fakeUserName', {
        page: 0,
      })
    })

    it('renders an empty result when no data is available', async () => {
      // Given a request for the 'first' dataset with valid query parameters
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '01/10/2026',
          to: '31/10/2026',
          view: 'true',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that includes the 'from' and 'to' filters
      const retrieve = jest
        .fn()
        .mockResolvedValue({ rows: [], pagination: { pageCount: 2, pageNumber: 1, pageSize: 10 } })
      const dataset = createMockDataset('first', { filters: ['from', 'to'], retrieve })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      await controller.view(req, res, next)

      // Then the response should render the original query params with no errors
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        validationErrors: undefined,
        from: '01/10/2026',
        to: '31/10/2026',
        policeForceArea: '',
        table: {
          columns: [{ text: 'Police force' }, { text: 'Matched crimes' }],
          rows: [[{ text: 'No results found for applied filters.', colspan: 2 }]],
          pagination: {
            currentPage: 2,
            hrefPrefix: '?from=01%2F10%2F2026&to=31%2F10%2F2026&view=true',
            pageCount: 2,
          },
        },
        downloadUrl: '/management-information/first/download?from=01%2F10%2F2026&to=31%2F10%2F2026',
      })

      // And it retrieves data when valid query parameters are provided
      expect(dataset.retrieve).toHaveBeenCalledWith('fakeUserName', {
        from: '2026-10-01T00:00:00.000Z',
        to: '2026-11-01T00:00:00.000Z',
        page: 0,
      })
    })

    it('renders validation errors for invalid query parameters', async () => {
      // Given a request for the 'first' dataset with an invalid 'from' date
      const req = createMockRequest({
        params: { id: 'first' },
        query: { from: '31/02/2026', view: 'true' },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that includes the 'from' filter
      const dataset = createMockDataset('first', { filters: ['from'] })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      await controller.view(req, res, next)

      // Then the response should include validation errors
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        from: '31/02/2026',
        policeForceArea: '',
        to: '',
        validationErrors: {
          from: 'Enter a valid from date',
        },
      })

      // And it does not retrieve data when there are validation errors
      expect(dataset.retrieve).not.toHaveBeenCalled()
    })

    it('returns 404 when the dataset does not exist', async () => {
      // Given a request for an unknown dataset
      const req = createMockRequest({
        params: { id: 'unknown' },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And no dataset is registered under the requested ID
      const registry = new DatasetRegistry()
      const controller = new DatasetController(registry)

      // When the view method is called
      await controller.view(req, res, next)

      // Then the response should indicate a 404 error and not render a page
      expect(next).toHaveBeenCalledTimes(1)
      expect(res.render).not.toHaveBeenCalled()
    })
  })
})
