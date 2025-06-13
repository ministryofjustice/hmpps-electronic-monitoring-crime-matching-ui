import ping from './ping'
import { stubCreateCrimeBatchesQuery, stubGetCrimeBatchesQuery } from './crimeBatches'
import { stubCreateSubjectsQuery, stubGetSubjectsQuery } from './subjects'

export default {
  stubCrimeMatchingPing: ping,
  stubCreateCrimeBatchesQuery,
  stubGetCrimeBatchesQuery,
  stubCreateSubjectsQuery,
  stubGetSubjectsQuery,
}
