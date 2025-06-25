import { dataAccess } from '../data'
import AuditService from './auditService'
import CrimeMappingService from './crimeMapping'
import CrimeBatchesService from './crimeMapping/crimeBatches'
import MapService from './mapService'
import SubjectsService from './locationData/subjects'
import SubjectService from './locationData/subject'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, crimeMatchingApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const crimeBatchesService = new CrimeBatchesService(crimeMatchingApiClient)
  const crimeMappingService = new CrimeMappingService()
  const mapService = new MapService()
  const subjectsService = new SubjectsService(crimeMatchingApiClient)
  const subjectService = new SubjectService(crimeMatchingApiClient)

  return {
    applicationInfo,
    auditService,
    crimeBatchesService,
    crimeMappingService,
    mapService,
    subjectsService,
    subjectService,
  }
}

export type Services = ReturnType<typeof services>
