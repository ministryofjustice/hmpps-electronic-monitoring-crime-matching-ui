import ping from './ping'
import { stubCreateCrimeBatchesQuery, stubGetCrimeBatchesQuery } from './crimeBatches'
import { stubGetPersons } from '../locationData/subjects'
import { stubGetSubject } from '../locationData/subject'
import { stubGetDeviceActivation } from '../locationData/deviceActivation'
import { stubGetDeviceActivationPositions } from '../locationData/deviceActivationPositions'

export default {
  stubCrimeMatchingPing: ping,
  stubCreateCrimeBatchesQuery,
  stubGetCrimeBatchesQuery,
  stubGetDeviceActivation,
  stubGetDeviceActivationPositions,
  stubGetPersons,
  stubGetSubject,
}
