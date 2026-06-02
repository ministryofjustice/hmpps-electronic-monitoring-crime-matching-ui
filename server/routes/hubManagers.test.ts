import request from 'supertest'
import { randomUUID } from 'crypto'
import { appWithAllRoutes, hubCaseworker, hubManager } from './testutils/appSetup'
import logger from '../../logger'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import HubManagersService from '../services/hubManagerService'

jest.mock('../data/crimeMatchingClient')
jest.mock('../../logger')

const authorisingManager = {
  id: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
  name: 'Test manager 1',
  occupation: 'MoJ EM Hub Manager',
  hasSignature: true,
}

describe('/hub-managers', () => {
  let restClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    restClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /hub-managers', () => {
    it('should return a 403 if the user is a caseworker', () => {
      const app = appWithAllRoutes({
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

  describe('GET /hub-managers/create', () => {
    it('should return a 403 if the user is a caseworker', () => {
      const app = appWithAllRoutes({
        userSupplier: () => hubCaseworker,
      })

      return request(app)
        .get('/hub-managers/create')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(403)
          expect(res.text).toContain('You do not have permission to complete this action')
        })
    })

    it('should return a 200 if the user is a manager', () => {
      const app = appWithAllRoutes({
        userSupplier: () => hubManager,
      })

      return request(app)
        .get('/hub-managers/create')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toContain('Create hub manager')
        })
    })
  })

  describe('POST /hub-managers/create', () => {
    it('should return a 403 if the user is a caseworker', () => {
      const app = appWithAllRoutes({
        userSupplier: () => hubCaseworker,
      })

      return request(app)
        .post('/hub-managers/create')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(403)
          expect(res.text).toContain('You do not have permission to complete this action')
        })
    })

    it('should return a 303 if the user is a manager', () => {
      const hubManagersService = new HubManagersService(restClient)
      const app = appWithAllRoutes({
        services: {
          hubManagersService,
        },
        userSupplier: () => hubManager,
      })

      restClient.createHubManager.mockResolvedValue({ data: authorisingManager })
      restClient.updateHubManagerSignature.mockResolvedValue({ data: authorisingManager })

      return request(app)
        .post('/hub-managers/create')
        .field('name', 'Test')
        .attach('file', Buffer.from('content'), 'image.png')
        .expect('Content-Type', /text\/plain/)
        .expect(303)
        .expect('Location', '/hub-managers')
    })
  })

  describe('POST /hub-managers/{id}/delete', () => {
    it('should return a 403 if the user is a caseworker', () => {
      const id = randomUUID()
      const app = appWithAllRoutes({
        userSupplier: () => hubCaseworker,
      })

      return request(app)
        .post(`/hub-managers/${id}/delete`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(403)
          expect(res.text).toContain('You do not have permission to complete this action')
        })
    })

    it('should return a 303 if the user is a manager', () => {
      const id = randomUUID()
      const hubManagersService = new HubManagersService(restClient)
      const app = appWithAllRoutes({
        services: {
          hubManagersService,
        },
        userSupplier: () => hubManager,
      })

      restClient.deleteHubManager.mockResolvedValue({})

      return request(app)
        .post(`/hub-managers/${id}/delete`)
        .expect('Content-Type', /text\/plain/)
        .expect(303)
        .expect('Location', '/hub-managers')
    })
  })
})
