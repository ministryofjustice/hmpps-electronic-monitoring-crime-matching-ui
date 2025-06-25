import ping from './ping'
import { stubCreateCrimeBatchesQuery, stubGetCrimeBatchesQuery } from './crimeBatches'
import { stubCreateSubjectsQuery, stubGetSubjectsQuery } from '../locationData/subjects'
import { stubCreateSubjectLocationsQuery } from '../locationData/subjectLocations'

export default {
  stubCrimeMatchingPing: ping,
  stubCreateCrimeBatchesQuery,
  stubGetCrimeBatchesQuery,
  stubCreateSubjectsQuery,
  stubGetSubjectsQuery,
  stubCreateSubjectLocationsQuery,
}
