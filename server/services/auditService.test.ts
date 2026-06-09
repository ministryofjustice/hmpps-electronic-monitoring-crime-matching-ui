import AuditService, { Page } from './auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'

jest.mock('../data/hmppsAuditClient')

describe('Audit service', () => {
  let hmppsAuditClient: jest.Mocked<HmppsAuditClient>
  let auditService: AuditService

  beforeEach(() => {
    hmppsAuditClient = new HmppsAuditClient({
      queueUrl: '',
      enabled: true,
      region: '',
      serviceName: '',
    }) as jest.Mocked<HmppsAuditClient>
    auditService = new AuditService(hmppsAuditClient)
  })

  describe('logAuditEvent', () => {
    it('sends audit message using audit client', async () => {
      await auditService.logAuditEvent({
        what: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })

  describe('logPageView', () => {
    it('sends page view event audit message using audit client', async () => {
      await auditService.logPageView(Page.HOMEPAGE, {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'PAGE_VIEW_HOMEPAGE',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })

  describe('logPageViewAttempt', () => {
    it('sends page view attempt event audit message using audit client', async () => {
      await auditService.logPageViewAttempt(Page.HOMEPAGE, {
        who: 'user1',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'PAGE_VIEW_ATTEMPT_HOMEPAGE',
        who: 'user1',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })

  describe('logSearch', () => {
    it('sends a search event audit message using audit client', async () => {
      await auditService.logSearch(Page.POLICE_DATA_INGESTION_ATTEMPTS, {
        who: 'user1',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'SEARCH_POLICE_DATA_INGESTION_ATTEMPTS',
        who: 'user1',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })

  describe('logExport', () => {
    it('sends an export event audit message using audit client', async () => {
      await auditService.logExport(Page.POLICE_DATA_INGESTION_ATTEMPT, {
        who: 'user1',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'EXPORT_POLICE_DATA_INGESTION_ATTEMPT',
        who: 'user1',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })
})
