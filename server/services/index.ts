import { dataAccess } from '../data'
import AuditService from './auditService'
import CrimeMappingService from './crimeMapping'
import CrimeBatchesService from './crimeMapping/crimeBatches'
import PersonsService from './personsService'
import DeviceActivationsService from './deviceActivationsService'
import ValidationService from './locationData/validationService'
import PoliceDataService from './policeDataService'
import CrimeMatchingResultsService from './crimeMatchingResultsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, crimeMatchingApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const crimeBatchesService = new CrimeBatchesService(crimeMatchingApiClient)
  const crimeMappingService = new CrimeMappingService()
  const crimeMatchingResultsService = new CrimeMatchingResultsService(crimeMatchingApiClient)
  const deviceActivationsService = new DeviceActivationsService(crimeMatchingApiClient)
  const validationService = new ValidationService(deviceActivationsService)
  const personsService = new PersonsService(crimeMatchingApiClient)
  const policeDataService = new PoliceDataService(crimeMatchingApiClient)

  return {
    applicationInfo,
    auditService,
    crimeBatchesService,
    crimeMappingService,
    crimeMatchingResultsService,
    deviceActivationsService,
    personsService,
    policeDataService,
    validationService,
  }
}

export type Services = ReturnType<typeof services>
