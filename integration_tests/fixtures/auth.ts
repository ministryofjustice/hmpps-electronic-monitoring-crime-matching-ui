import { UserToken } from '../mockApis/auth'

const hubCaseworker: UserToken = {
  name: 'J. Smith',
  roles: ['ROLE_CRIME_MATCHING_HUB_CASEWORKER'],
}

const hubManager: UserToken = {
  name: 'Manager',
  roles: ['ROLE_CRIME_MATCHING_HUB_MANAGER'],
}

export { hubCaseworker, hubManager }
