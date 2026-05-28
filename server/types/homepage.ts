import { Role } from '../constants/roles'

export type HomepageSection = 'caseworker' | 'admin'

export type HomepageFeature = {
  id: string
  section: HomepageSection
  href: string
  heading: string
  description: string
  permittedRoles: Array<Role>
}
