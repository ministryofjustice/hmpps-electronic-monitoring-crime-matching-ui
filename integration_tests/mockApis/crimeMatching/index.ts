import ping from './ping'
import { stubCreateCrimeBatchesQuery, stubGetCrimeBatchesQuery } from './crimeBatches'
import { stubGetPersons } from '../locationData/subjects'
import { stubCreateSubjectLocationsQuery } from '../locationData/subjectLocations'
import { stubGetSubject } from '../locationData/subject'

export default {
  stubCrimeMatchingPing: ping,
  stubCreateCrimeBatchesQuery,
  stubGetCrimeBatchesQuery,
  stubGetPersons,
  stubCreateSubjectLocationsQuery,
  stubGetSubject,
}
