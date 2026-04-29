import logger from '../../../logger'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import HubManagersService from '../../services/hubManagerService'
import createMockFile from '../../testutils/createMockFile'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import expectedAuthOptions from '../../testutils/expectedAuthOptions'
import CreateHubManagersController from './create'

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

describe('CreateHubManagerController', () => {
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
      const controller = new CreateHubManagersController(service)

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
        const controller = new CreateHubManagersController(service)

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
      const controller = new CreateHubManagersController(service)

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
      expect(res.redirect).toHaveBeenCalledWith(303, '/hub-managers')
    })
  })
})
