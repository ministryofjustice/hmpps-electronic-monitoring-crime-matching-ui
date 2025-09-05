import ping from './ping'
import { stubCreateCrimeBatchesQuery, stubGetCrimeBatchesQuery } from './crimeBatches'
import { stubGetPersons } from '../locationData/subjects'
import { stubGetDeviceActivation } from '../locationData/deviceActivation'
import { stubGetDeviceActivationPositions } from '../locationData/deviceActivationPositions'
import { stubGetPerson } from '../locationData/person'

export default {
  stubCrimeMatchingPing: ping,
  stubCreateCrimeBatchesQuery,
  stubGetCrimeBatchesQuery,
  stubGetDeviceActivation,
  stubGetDeviceActivationPositions,
  stubGetPersons,
  stubGetPerson,
}
