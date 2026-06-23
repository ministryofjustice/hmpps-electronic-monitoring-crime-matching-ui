import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  HOMEPAGE = 'HOMEPAGE',
  HUB_MANAGERS = 'HUB_MANAGERS',
  LOCATION_DATA_DEVICE_ACTIVATION = 'LOCATION_DATA_DEVICE_ACTIVATION',
  LOCATION_DATA_DEVICE_ACTIVATIONS = 'LOCATION_DATA_DEVICE_ACTIVATIONS',
  POLICE_DATA_INGESTION_ATTEMPT = 'POLICE_DATA_INGESTION_ATTEMPT',
  POLICE_DATA_INGESTION_ATTEMPTS = 'POLICE_DATA_INGESTION_ATTEMPTS',
  PROXIMITY_ALERT_CRIME_VERSION = 'PROXIMITY_ALERT_CRIME_VERSION',
  PROXIMITY_ALERT_CRIME_VERSIONS = 'PROXIMITY_ALERT_CRIME_VERSIONS',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageViewAttempt(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_ATTEMPT_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
