import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import logger from '../../logger'
import DeviceActivationsService from '../services/deviceActivationsService'
import ValidationService from '../services/locationData/validationService'
import PersonsService from '../services/personsService'
import CrimeMatchingClient from '../data/crimeMatchingClient'

jest.mock('../data/crimeMatchingClient')
jest.mock('../../logger')

describe('/location-data', () => {
  let restClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    restClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /location-data/device-activations/:deviceActivationId', () => {
    it('should return a 404 if the deviceActivationId is missing', () => {
      const deviceActivationsService = new DeviceActivationsService(restClient)
      const personsService = new PersonsService(restClient)
      const validationService = new ValidationService(deviceActivationsService)
      const app = appWithAllRoutes({
        services: {
          deviceActivationsService,
          personsService,
          validationService,
        },
        userSupplier: () => user,
      })

      return request(app)
        .get('/location-data/device-activations/')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(404)
          expect(res.text).toContain('<title>HMPPS Electronic Monitoring Crime Matching - Error</title>')
          expect(res.text).toContain('<h1>Not Found</h1>')
        })
    })

    it('should return a 404 if the Device Activation cannot be found', () => {
      const deviceActivationsService = new DeviceActivationsService(restClient)
      const personsService = new PersonsService(restClient)
      const validationService = new ValidationService(deviceActivationsService)
      const app = appWithAllRoutes({
        services: {
          deviceActivationsService,
          personsService,
          validationService,
        },
        userSupplier: () => user,
      })

      restClient.getDeviceActivation.mockRejectedValue({
        message: 'Not Found',
        name: 'Not Found',
        stack: '',
        status: 404,
      })

      return request(app)
        .get('/location-data/device-activations/123456789')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(404)
          expect(res.text).toContain('<title>HMPPS Electronic Monitoring Crime Matching - Error</title>')
          expect(res.text).toContain('<h1>Not Found</h1>')
        })
    })

    it('should return a 200 if the Device Activation was found', () => {
      const deviceActivationsService = new DeviceActivationsService(restClient)
      const personsService = new PersonsService(restClient)
      const validationService = new ValidationService(deviceActivationsService)
      const app = appWithAllRoutes({
        services: {
          deviceActivationsService,
          personsService,
          validationService,
        },
        userSupplier: () => user,
      })

      restClient.getDeviceActivation.mockResolvedValueOnce({
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
      })

      return request(app)
        .get('/location-data/device-activations/123456789')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toContain('<title>HMPPS Electronic Monitoring Crime Matching - Home</title>')
        })
    })
  })
})
