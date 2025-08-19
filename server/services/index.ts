import { dataAccess } from '../data'
import AuditService from './auditService'
import CrimeMappingService from './crimeMapping'
import CrimeBatchesService from './crimeMapping/crimeBatches'
import MapService from './mapService'
import SubjectService from './locationData/subject'
import PersonsService from './personsService'
import DeviceActivationsService from './deviceActivationsService'
import ValidationService from './locationData/validationService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, crimeMatchingApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const crimeBatchesService = new CrimeBatchesService(crimeMatchingApiClient)
  const crimeMappingService = new CrimeMappingService()
  const deviceActivationsService = new DeviceActivationsService(crimeMatchingApiClient)
  const mapService = new MapService()
  const validationService = new ValidationService(deviceActivationsService)
  const subjectService = new SubjectService(crimeMatchingApiClient)
  const personsService = new PersonsService(crimeMatchingApiClient)

  return {
    applicationInfo,
    auditService,
    crimeBatchesService,
    crimeMappingService,
    deviceActivationsService,
    mapService,
    personsService,
    subjectService,
    validationService,
  }
}

export type Services = ReturnType<typeof services>
