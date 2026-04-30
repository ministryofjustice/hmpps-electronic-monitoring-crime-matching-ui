import ping from './ping'
import { stubGetCrimeMatchingResults } from './crimeMatchingResults'
import { stubGetCrimeVersions } from './crimeVersions'
import { stubGetPersons } from '../locationData/persons'
import { stubGetDeviceActivation } from '../locationData/deviceActivation'
import { stubGetDeviceActivationPositions } from '../locationData/deviceActivationPositions'
import { stubGetIngestionAttempt } from './ingestionAttempt'
import { stubGetIngestionAttempts } from './ingestionAttempts'
import { stubGetPerson } from '../locationData/person'
import { stubGetCrimeVersion } from './crimeVersion'
import {
  stubCreateHubManager,
  stubDeleteHubManager,
  stubGetHubManagers,
  stubUpdateHubManagerSignature,
} from './hubManagers'

export default {
  stubCreateHubManager,
  stubCrimeMatchingPing: ping,
  stubDeleteHubManager,
  stubGetCrimeMatchingResults,
  stubGetCrimeVersion,
  stubGetCrimeVersions,
  stubGetDeviceActivation,
  stubGetDeviceActivationPositions,
  stubGetHubManagers,
  stubGetIngestionAttempt,
  stubGetIngestionAttempts,
  stubGetPersons,
  stubGetPerson,
  stubUpdateHubManagerSignature,
}
