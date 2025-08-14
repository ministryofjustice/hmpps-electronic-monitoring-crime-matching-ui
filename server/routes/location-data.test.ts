import type { Express } from 'express'
import request from 'supertest'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import { appWithAllRoutes, user } from './testutils/appSetup'
import logger from '../../logger'
import DeviceActivationsService from '../services/deviceActivationsService'

jest.mock('@ministryofjustice/hmpps-rest-client')
jest.mock('../../logger')

describe('/location-data', () => {
  let restClient: jest.Mocked<RestClient>

  beforeEach(() => {
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

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /location-data/device-activations/:deviceActivationId', () => {
    it('should return a 404 if the deviceActivationId is missing', () => {
      const deviceActivationsService = new DeviceActivationsService(restClient)
      const app = appWithAllRoutes({
        services: {
          deviceActivationsService,
        },
        userSupplier: () => user,
      })

      return request(app)
        .get('/location-data/device-activations/')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(404)
          expect(res.text).toContain('Not Found')
        })
    })

    it('should return a 404 if the Device Activation cannot be found', () => {
      const deviceActivationsService = new DeviceActivationsService(restClient)
      const app = appWithAllRoutes({
        services: {
          deviceActivationsService,
        },
        userSupplier: () => user,
      })

      restClient.get.mockRejectedValue({
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
          expect(res.text).toContain('Not Found')
        })
    })

    it('should return a 200 if the Device Activation was found', () => {
      const deviceActivationsService = new DeviceActivationsService(restClient)
      const app = appWithAllRoutes({
        services: {
          deviceActivationsService,
        },
        userSupplier: () => user,
      })

      restClient.get.mockResolvedValue({
        data: {
          deviceActivationId: 123456789,
          deviceId: 123456789,
          personId: 123456789,
          deviceActivationDate: '2025-01-01T00:00:00.000Z',
          deviceDeactivationDate: null,
        },
      })

      return request(app)
        .get('/location-data/device-activations/123456789')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toContain('Not Found')
        })
    })
  })
})
