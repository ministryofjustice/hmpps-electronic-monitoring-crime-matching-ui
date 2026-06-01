import request from 'supertest'
import { appWithAllRoutes, hubCaseworker, hubManager } from './testutils/appSetup'
import logger from '../../logger'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import HubManagersService from '../services/hubManagerService'

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

  describe('GET /hub-managers', () => {
    it('should return a 403 if the user is a caseworker', () => {
      const hubManagersService = new HubManagersService(restClient)
      const app = appWithAllRoutes({
        services: {
          hubManagersService,
        },
        userSupplier: () => hubCaseworker,
      })

      return request(app)
        .get('/hub-managers')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(403)
          expect(res.text).toContain('You do not have permission to complete this action')
        })
    })

    it('should return a 200 if the user is a manager', () => {
      const hubManagersService = new HubManagersService(restClient)
      const app = appWithAllRoutes({
        services: {
          hubManagersService,
        },
        userSupplier: () => hubManager,
      })

      restClient.getHubManagers.mockResolvedValue({
        data: [],
      })

      return request(app)
        .get('/hub-managers')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toContain('Hub managers')
        })
    })
  })
})
