import { ROLES } from '../constants/roles'
import URLS from '../constants/urls'
import { HmppsUser } from '../interfaces/hmppsUser'
import { HomepageFeature } from '../types/homepage'

class FeaturesService {
  constructor() {}

  private get features(): Array<HomepageFeature> {
    return [
      {
        id: 'create-proximity-alert',
        section: 'caseworker',
        href: URLS.PROXIMITY_ALERT.CRIME_VERSIONS.VIEW,
        heading: 'Create a proximity alert',
        description: 'Search for a crime and create a new proximity alert.',
        permittedRoles: [ROLES.CRIME_MATCHING_HUB_CASEWORKER, ROLES.CRIME_MATCHING_HUB_MANAGER],
      },
      {
        id: 'view-location-data',
        section: 'caseworker',
        href: '/location-data/persons',
        heading: 'View location data',
        description: 'Search for a person and view location data.',
        permittedRoles: [ROLES.CRIME_MATCHING_HUB_CASEWORKER, ROLES.CRIME_MATCHING_HUB_MANAGER],
      },
      {
        id: 'view-police-data',
        section: 'caseworker',
        href: URLS.POLICE_DATA.INGESTION_ATTEMPTS.VIEW,
        heading: 'View crime batches',
        description: 'View ingested crime batches and export crime matching results.',
        permittedRoles: [ROLES.CRIME_MATCHING_HUB_CASEWORKER, ROLES.CRIME_MATCHING_HUB_MANAGER],
      },
      {
        id: 'view-hub-managers',
        section: 'admin',
        href: URLS.HUB_MANAGERS.VIEW,
        heading: 'Manage authorising managers',
        description: 'View managers that can review and authorise proximity alerts.',
        permittedRoles: [ROLES.CRIME_MATCHING_HUB_MANAGER],
      },
    ]
  }

  getFeaturesForUser(user: HmppsUser) {
    return this.features.filter((feature: HomepageFeature): boolean => {
      return feature.permittedRoles.some(role => user.userRoles.includes(role))
    })
  }
}

export default FeaturesService
