import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'
import FeaturesService from '../services/featuresService'

jest.mock('../services/auditService')
jest.mock('../data/hmppsAuditClient')
jest.mock('@ministryofjustice/hmpps-rest-client')

const hmppsAuditClient = new HmppsAuditClient({
  queueUrl: '',
  enabled: true,
  region: '',
  serviceName: '',
}) as jest.Mocked<HmppsAuditClient>
const auditService = new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>
const featuresService = new FeaturesService()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      featuresService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    auditService.logPageView.mockResolvedValue()

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Crime matching tool')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.HOMEPAGE, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })
})
