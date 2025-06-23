import { dataAccess } from '../data'
import AuditService from './auditService'
import CrimeMappingService from './crimeMapping'
import CrimeBatchesService from './crimeMapping/crimeBatches'
import MapService from './mapService'
import SubjectService from './subject/subjects'
import SubjectLocationService from './subjectLocation/subjectLocations'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, crimeMatchingApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const crimeBatchesService = new CrimeBatchesService(crimeMatchingApiClient)
  const crimeMappingService = new CrimeMappingService()
  const mapService = new MapService()
  const subjectService = new SubjectService(crimeMatchingApiClient)
  const subjectLocationService = new SubjectLocationService(crimeMatchingApiClient)

  return {
    applicationInfo,
    auditService,
    crimeBatchesService,
    crimeMappingService,
    mapService,
    subjectService,
    subjectLocationService,
  }
}

export type Services = ReturnType<typeof services>
