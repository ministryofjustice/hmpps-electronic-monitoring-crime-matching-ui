import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import HomepageController from './homepage'
import FeaturesService from '../services/featuresService'
import AuditService, { Page } from '../services/auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'
import { ROLES } from '../constants/roles'

jest.mock('../services/auditService')
jest.mock('../data/hmppsAuditClient')
jest.mock('@ministryofjustice/hmpps-rest-client')

const createProximityAlertFeature = {
  description: 'Search for a crime and create a new proximity alert',
  heading: 'Create a proximity alert',
  href: '/proximity-alert',
  id: 'create-proximity-alert',
}

const viewLocationDataFeature = {
  description: 'Search for a person and view location data',
  heading: 'View location data',
  href: '/location-data/persons',
  id: 'view-location-data',
}

const viewPoliceDataFeature = {
  description: 'Search for a person and view location data',
  heading: 'View crime batches',
  href: '/police-data/dashboard',
  id: 'view-police-data',
}

const manageAuthorisingManagersFeature = {
  id: 'view-hub-managers',
  href: '/hub-managers',
  heading: 'Manage authorising managers',
  description: 'View managers that can review and authorise proximity alerts',
}

describe('HomepageController', () => {
  const hmppsAuditClient = new HmppsAuditClient({
    queueUrl: '',
    enabled: true,
    region: '',
    serviceName: '',
  }) as jest.Mocked<HmppsAuditClient>
  const auditService = new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>
  const featuresService = new FeaturesService()

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('view', () => {
    it('should show only the caseworker features when the user is a hub caseworder', async () => {
      const req = createMockRequest({})
      const res = createMockResponse([ROLES.CRIME_MATCHING_HUB_CASEWORKER])
      const next = jest.fn()
      const controller = new HomepageController(auditService, featuresService)

      // When
      await controller.view(req, res, next)

      expect(auditService.logPageView).toHaveBeenCalledWith(Page.HOMEPAGE, {
        who: 'fakeUserName',
        correlationId: expect.any(String),
      })
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        features: {
          caseworker: [createProximityAlertFeature, viewLocationDataFeature, viewPoliceDataFeature],
          admin: [],
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should show the caseworker and admin features when the user is a hub manager', async () => {
      const req = createMockRequest({})
      const res = createMockResponse([ROLES.CRIME_MATCHING_HUB_MANAGER])
      const next = jest.fn()
      const controller = new HomepageController(auditService, featuresService)

      // When
      await controller.view(req, res, next)

      expect(auditService.logPageView).toHaveBeenCalledWith(Page.HOMEPAGE, {
        who: 'fakeUserName',
        correlationId: expect.any(String),
      })
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        features: {
          caseworker: [createProximityAlertFeature, viewLocationDataFeature, viewPoliceDataFeature],
          admin: [manageAuthorisingManagersFeature],
        },
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})
