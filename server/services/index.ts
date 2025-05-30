import { dataAccess } from '../data'
import AuditService from './auditService'
import CrimeMappingService from './crimeMapping'
import MapService from './mapService'
import SubjectService from './subjectService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, crimeMatchingApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const crimeMappingService = new CrimeMappingService()
  const mapService = new MapService()
  const subjectService = new SubjectService(crimeMatchingApiClient)

  return {
    applicationInfo,
    auditService,
    crimeMappingService,
    mapService,
    subjectService,
  }
}

export type Services = ReturnType<typeof services>
