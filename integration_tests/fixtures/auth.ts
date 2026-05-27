import { UserToken } from '../mockApis/auth'

const hubCaseworker: UserToken = {
  name: 'J. Smith',
  roles: ['CRIME_MATCHING_HUB_CASEWORKER'],
}

const hubManager: UserToken = {
  name: 'Manager',
  roles: ['CRIME_MATCHING_HUB_MANAGER'],
}

export { hubCaseworker, hubManager }
