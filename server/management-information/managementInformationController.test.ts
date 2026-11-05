import createMockDataset from '../testutils/createMockDataset'
import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import DatasetRegistry from './datasetRegistry'
import ManagementInformationController from './managementInformationController'

describe('ManagementInformationController', () => {
  describe('view', () => {
    it('renders the landing page with registered datasets', () => {
      // Given a request
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()

      // And a registry with some datasets
      const datasets = [createMockDataset('first'), createMockDataset('second')]
      const registry = new DatasetRegistry(datasets)
      const controller = new ManagementInformationController(registry)

      // When the view method is called
      controller.view(req, res, next)

      // Then the response should render the index page with the datasets
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/index', {
        datasets,
      })
    })

    it('renders the landing page when no datasets are registered', () => {
      // Given a request
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()

      // And a registry with no datasets
      const registry = new DatasetRegistry()
      const controller = new ManagementInformationController(registry)

      // When the view method is called
      controller.view(req, res, next)

      // Then the response should render the index page with an empty dataset list
      expect(res.render).toHaveBeenCalledWith('pages/managementInformation/index', {
        datasets: [],
      })
    })
  })
})
