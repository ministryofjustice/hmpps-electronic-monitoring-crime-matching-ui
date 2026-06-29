import logger from '../../../logger'
import URLS from '../../constants/urls'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import HmppsAuditClient from '../../data/hmppsAuditClient'
import AuditService, { Page } from '../../services/auditService'
import HubManagersService from '../../services/hubManagerService'
import createMockFile from '../../testutils/createMockFile'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import expectedAuthOptions from '../../testutils/expectedAuthOptions'
import CreateHubManagersController from './create'

jest.mock('../../services/auditService')
jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

describe('CreateHubManagerController', () => {
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
    it('should render the create hub manager view', async () => {
      // Given
      const req = createMockRequest()
      const res = createMockResponse()
      const next = jest.fn()
      const service = new HubManagersService(mockRestClient)
      const controller = new CreateHubManagersController(auditService, service)

      // When
      await controller.view(req, res, next)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/hubManagers/create')
    })
  })

  describe('submit', () => {
    it.each([[{ name: undefined }], [{ name: '' }], [{ name: ' ' }]])(
      'should render validation errors if invalid data entered',
      async ({ name }) => {
        // Given
        const req = createMockRequest({ body: { name } })
        const res = createMockResponse()
        const next = jest.fn()
        const service = new HubManagersService(mockRestClient)
        const controller = new CreateHubManagersController(auditService, service)

        // When
        await controller.submit(req, res, next)

        // Then
        expect(mockRestClient.createHubManager).not.toHaveBeenCalled()
        expect(mockRestClient.updateHubManagerSignature).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/hubManagers/create', {
          name,
          validationErrors: {
            file: 'Upload a file',
            name: 'Enter a name',
          },
        })
        expect(auditService.logApiModificationCall).toHaveBeenCalledWith('ATTEMPT', 'CREATE', Page.HUB_MANAGER, {
          who: 'fakeUserName',
          correlationId: req.id,
        })
      },
    )

    it('should create a hub manager, update the signature and redirect to the list', async () => {
      // Given
      const req = createMockRequest({
        body: {
          name: 'Test manager',
        },
        file: createMockFile({ originalname: 'signature.png' }),
      })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new HubManagersService(mockRestClient)
      const controller = new CreateHubManagersController(auditService, service)

      mockRestClient.createHubManager.mockResolvedValue({
        data: {
          id: '5eb2f98e-0e8f-4519-9d52-20ff86cadbd2',
          name: 'Test manager',
          hasSignature: false,
        },
      })
      mockRestClient.updateHubManagerSignature.mockResolvedValue({
        data: {
          id: '5eb2f98e-0e8f-4519-9d52-20ff86cadbd2',
          name: 'Test manager',
          hasSignature: true,
        },
      })

      // When
      await controller.submit(req, res, next)

      // Then
      expect(mockRestClient.createHubManager).toHaveBeenCalledWith(expectedAuthOptions, 'Test manager')
      expect(mockRestClient.updateHubManagerSignature).toHaveBeenCalledWith(
        expectedAuthOptions,
        '5eb2f98e-0e8f-4519-9d52-20ff86cadbd2',
        expect.objectContaining({
          buffer: Buffer.from(''),
          originalname: 'signature.png',
        }),
      )
      expect(res.redirect).toHaveBeenCalledWith(303, URLS.HUB_MANAGERS.VIEW)
      expect(auditService.logApiModificationCall).toHaveBeenCalledWith('ATTEMPT', 'CREATE', Page.HUB_MANAGER, {
        who: 'fakeUserName',
        correlationId: req.id,
      })
      expect(auditService.logApiModificationCall).toHaveBeenCalledWith('SUCCESS', 'CREATE', Page.HUB_MANAGER, {
        who: 'fakeUserName',
        correlationId: req.id,
      })
    })
  })
})
