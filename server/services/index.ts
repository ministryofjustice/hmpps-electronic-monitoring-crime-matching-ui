import { dataAccess } from '../data'
import AuditService from './auditService'
import CrimeMappingService from './crimeMapping'
import MapService from './mapService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const crimeMappingService = new CrimeMappingService()
  const mapService = new MapService()

  return {
    applicationInfo,
    auditService,
    crimeMappingService,
    mapService,
  }
}

export type Services = ReturnType<typeof services>
