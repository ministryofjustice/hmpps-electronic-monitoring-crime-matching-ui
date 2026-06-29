import logger from '../../../logger'
import URLS from '../../constants/urls'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import HmppsAuditClient from '../../data/hmppsAuditClient'
import AuditService, { Page } from '../../services/auditService'
import HubManagersService from '../../services/hubManagerService'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import expectedAuthOptions from '../../testutils/expectedAuthOptions'
import ListHubManagersController from './list'

jest.mock('../../services/auditService')
jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

describe('ListHubManagersController', () => {
  const hmppsAuditClient = new HmppsAuditClient({
    queueUrl: '',
    enabled: true,
    region: 'eu-west-2',
    serviceName: '',
  }) as jest.Mocked<HmppsAuditClient>
  const auditService = new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>
  let mockRestClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('view', () => {
    it('should query the api and render a list of hub managers', async () => {
      // Given
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()
      const service = new HubManagersService(mockRestClient)
      const controller = new ListHubManagersController(auditService, service)

      mockRestClient.getHubManagers.mockResolvedValue({
        data: [
          {
            id: 'c0350a84-5a82-40aa-8daa-9de3dcd9a15f',
            name: 'Test manager 1',
            occupation: 'MoJ EM Hub Manager',
            hasSignature: true,
          },
        ],
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getHubManagers).toHaveBeenCalledWith(expectedAuthOptions)
      expect(res.render).toHaveBeenCalledWith('pages/hubManagers/list', {
        hubManagers: [
          {
            id: 'c0350a84-5a82-40aa-8daa-9de3dcd9a15f',
            name: 'Test manager 1',
            occupation: 'MoJ EM Hub Manager',
            hasSignature: true,
          },
        ],
      })
    })
  })

  describe('delete', () => {
    it('should delete a hub manager and redirect to the list', async () => {
      // Given
      const req = createMockRequest({ params: { id: 'b90f4016-6d0d-4a70-a1ac-a48e43dc48eb' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new HubManagersService(mockRestClient)
      const controller = new ListHubManagersController(auditService, service)

      // When
      await controller.delete(req, res, next)

      // Then
      expect(mockRestClient.deleteHubManager).toHaveBeenCalledWith(
        expectedAuthOptions,
        'b90f4016-6d0d-4a70-a1ac-a48e43dc48eb',
      )
      expect(res.redirect).toHaveBeenCalledWith(303, URLS.HUB_MANAGERS.VIEW)
      expect(auditService.logApiModificationCall).toHaveBeenCalledWith('ATTEMPT', 'DELETE', Page.HUB_MANAGER, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            id: 'b90f4016-6d0d-4a70-a1ac-a48e43dc48eb',
          },
        },
      })
      expect(auditService.logApiModificationCall).toHaveBeenCalledWith('SUCCESS', 'DELETE', Page.HUB_MANAGER, {
        who: 'fakeUserName',
        correlationId: req.id,
        details: {
          params: {
            id: 'b90f4016-6d0d-4a70-a1ac-a48e43dc48eb',
          },
        },
      })
    })
  })
})
