import request from 'supertest'
import logger from '../../logger'
import { appWithAllRoutes, hubCaseworker, hubManager } from '../routes/testutils/appSetup'
import HmppsAuditClient from '../data/hmppsAuditClient'
import AuditService, { Page } from '../services/auditService'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import ZeroPrecisionCrimeMatches from './datasets/zeroPrecisionCrimeMatches'

jest.mock('../services/auditService')
jest.mock('../data/crimeMatchingClient')
jest.mock('../../logger')

describe('/management-information', () => {
  const crimeMatchingApiClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
  const hmppsAuditClient = new HmppsAuditClient({
    queueUrl: '',
    enabled: true,
    region: '',
    serviceName: '',
  }) as jest.Mocked<HmppsAuditClient>
  const auditService = new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>
  const userSupplier = jest.fn()
  const app = appWithAllRoutes({
    userSupplier,
    services: {
      auditService,
      crimeMatchingApiClient,
    },
  })
  const datasets = [new ZeroPrecisionCrimeMatches(crimeMatchingApiClient)]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/', () => {
    it('should render the landing page for a hub manager', () => {
      // Given the user is a hub manager
      userSupplier.mockReturnValue(hubManager)

      // When the user requests the landing page, then it should render the landing page
      return request(app)
        .get(`/management-information/`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toContain('Management information')
          expect(auditService.logPageView).toHaveBeenCalledWith(Page.MANAGEMENT_INFORMATION_LANDING, {
            who: hubManager.username,
            correlationId: expect.any(String),
            details: {
              params: {},
              query: {},
            },
          })
        })
    })

    it('should return 403 for a hub caseworker', () => {
      // Given the user is a hub caseworker
      userSupplier.mockReturnValue(hubCaseworker)

      // When the user requests the landing page, then it should render the landing page
      return request(app)
        .get(`/management-information/`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(403)
          expect(auditService.logPageView).not.toHaveBeenCalled()
        })
    })
  })

  describe('/:id', () => {
    it.each(datasets)('should render the dataset for a hub manager', dataset => {
      // Given the user is a hub manager
      userSupplier.mockReturnValue(hubManager)

      // When the user requests the dataset page, then it should render the dataset
      return request(app)
        .get(`/management-information/${dataset.id}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toContain(dataset.title)
          expect(auditService.logPageView).toHaveBeenCalledWith(Page.MANAGEMENT_INFORMATION_DATASET, {
            who: hubManager.username,
            correlationId: expect.any(String),
            details: {
              params: { id: dataset.id },
              query: {},
            },
          })
        })
    })

    it.each(datasets)('should return 403 for a caseworker', dataset => {
      // Given the user is a caseworker
      userSupplier.mockReturnValue(hubCaseworker)

      // When the user requests the dataset page, then it should return 403
      return request(app)
        .get(`/management-information/${dataset.id}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(403)
          expect(auditService.logPageView).not.toHaveBeenCalled()
        })
    })

    it('should return 404 for a non-existent dataset', () => {
      // Given the user is a hub manager
      userSupplier.mockReturnValue(hubManager)

      // When the user requests a non-existent dataset page, then it should return 404
      return request(app)
        .get('/management-information/non-existent-dataset')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(404)
          expect(auditService.logPageView).not.toHaveBeenCalled()
        })
    })
  })

  describe('/:id/export', () => {
    it.each(datasets)('should return 403 for a caseworker', dataset => {
      // Given the user is a caseworker
      userSupplier.mockReturnValue(hubCaseworker)

      // When the user requests the dataset page, then it should return 403
      return request(app)
        .get(`/management-information/${dataset.id}/export?format=csv`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(403)
          expect(auditService.logPageView).not.toHaveBeenCalled()
        })
    })

    it('should return 404 for a non-existent dataset', () => {
      // Given the user is a hub manager
      userSupplier.mockReturnValue(hubManager)

      // When the user requests a non-existent dataset page, then it should return 404
      return request(app)
        .get('/management-information/non-existent-dataset/export?format=csv')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.status).toEqual(404)
          expect(auditService.logPageView).not.toHaveBeenCalled()
        })
    })
  })
})
