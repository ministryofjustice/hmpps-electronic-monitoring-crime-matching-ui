import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import DeviceActivationsService from '../services/deviceActivationsService'
import populateDeviceActivation from './populateDeviceActivation'
import logger from '../../logger'

jest.mock('@ministryofjustice/hmpps-rest-client')
jest.mock('../../logger')

const notFoundResponse = {
  message: 'Not Found',
  name: 'Not Found',
  stack: '',
  status: 404,
}

const successResponse = {
  data: {
    deviceActivationId: 123456789,
    deviceId: 123456789,
    deviceName: '123456789',
    personId: 123456789,
    deviceActivationDate: '2025-01-01T00:00:00.000Z',
    deviceDeactivationDate: null,
    orderStart: '2024-12-01T00:00:00.000Z',
    orderEnd: '2024-12-31T00:00:00.000Z',
  },
}

describe('populateDeviceActivation', () => {
  let restClient: jest.Mocked<RestClient>

  beforeEach(() => {
    jest.resetAllMocks()

    restClient = new RestClient(
      'crimeMatchingApi',
      {
        url: '',
        timeout: { response: 0, deadline: 0 },
        agent: { timeout: 0 },
      },
      logger,
    ) as jest.Mocked<RestClient>
  })

  it('should throw an error when the device activation was not found', async () => {
    // Given
    const req = createMockRequest()
    const res = createMockResponse()
    const next = jest.fn()
    const service = new DeviceActivationsService(restClient)

    // Stub a 404 response from the API
    restClient.get.mockRejectedValue({
      message: 'Not Found',
      name: 'Not Found',
      stack: '',
      status: 404,
    })

    // When
    await populateDeviceActivation(service)(req, res, next, '123456789', 'deviceActivationId')

    // Then
    expect(next).toHaveBeenCalledWith(notFoundResponse)
    expect(res.locals).not.toHaveProperty('isOrderEditable')
    expect(res.locals).not.toHaveProperty('orderId')
  })

  it('should hydrate the req/res correctly when the device activation was found', async () => {
    // Given
    const req = createMockRequest()
    const res = createMockResponse()
    const next = jest.fn()
    const service = new DeviceActivationsService(restClient)

    // Stub a 200 response from the API
    restClient.get.mockResolvedValue(successResponse)

    // When
    await populateDeviceActivation(service)(req, res, next, '123456789', 'deviceActivationId')

    // Then
    expect(next).toHaveBeenCalledWith()
    expect(req.deviceActivation).toEqual(successResponse.data)
  })
})
