import createMockDataset from '../testutils/createMockDataset'
import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import DatasetRegistry from './datasetRegistry'
import DatasetController from './datasetController'

describe('DatasetController', () => {
  describe('view', () => {
    it('renders the requested dataset', () => {
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
      controller.view(req, res, next)

      // Then the response should render the dataset page with the dataset
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        validationErrors: undefined,
        from: '',
        to: '',
        policeForceArea: '',
      })
    })

    it('renders the dataset with valid query parameters', () => {
      // Given a request for the 'first' dataset with valid query parameters
      const req = createMockRequest({
        params: { id: 'first' },
        query: {
          from: '01/10/2026',
          to: '31/10/2026',
        },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that includes the 'from' and 'to' filters
      const dataset = createMockDataset('first', { filters: ['from', 'to'] })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      controller.view(req, res, next)

      // Then the response should render the original query params with no errors
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/dataset', {
        dataset,
        validationErrors: undefined,
        from: '01/10/2026',
        to: '31/10/2026',
        policeForceArea: '',
      })
    })

    it('renders validation errors for invalid query parameters', () => {
      // Given a request for the 'first' dataset with an invalid 'from' date
      const req = createMockRequest({
        params: { id: 'first' },
        query: { from: '31/02/2026' },
      })
      const res = createMockResponse()
      const next = jest.fn()

      // And a dataset that includes the 'from' filter
      const dataset = createMockDataset('first', { filters: ['from'] })
      const registry = new DatasetRegistry([dataset])
      const controller = new DatasetController(registry)

      // When the view method is called
      controller.view(req, res, next)

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
    })

    it('returns 404 when the dataset does not exist', () => {
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
      controller.view(req, res, next)

      // Then the response should indicate a 404 error and not render a page
      expect(next).toHaveBeenCalledTimes(1)
      expect(res.render).not.toHaveBeenCalled()
    })
  })
})
