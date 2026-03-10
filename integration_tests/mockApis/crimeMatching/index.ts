import ping from './ping'
import { stubGetCrimeMatchingResults } from './crimeMatchingResults'
import { stubGetCrimeVersions } from './crimeVersions'
import { stubGetPersons } from '../locationData/persons'
import { stubGetDeviceActivation } from '../locationData/deviceActivation'
import { stubGetDeviceActivationPositions } from '../locationData/deviceActivationPositions'
import { stubGetIngestionAttempts } from './ingestionAttempts'
import { stubGetPerson } from '../locationData/person'

export default {
  stubCrimeMatchingPing: ping,
  stubGetCrimeMatchingResults,
  stubGetCrimeVersions,
  stubGetDeviceActivation,
  stubGetDeviceActivationPositions,
  stubGetIngestionAttempts,
  stubGetPersons,
  stubGetPerson,
}
