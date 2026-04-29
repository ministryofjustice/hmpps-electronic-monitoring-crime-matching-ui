import { dataAccess } from '../data'
import AuditService from './auditService'
import PersonsService from './personsService'
import DeviceActivationsService from './deviceActivationsService'
import ValidationService from './locationData/validationService'
import PoliceDataService from './policeDataService'
import CrimeService from './crimeService'
import CrimeMatchingResultsService from './crimeMatchingResultsService'
import PlaywrightBrowserService from './proximityAlert/playwrightBrowserService'
import HubManagersService from './hubManagerService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, crimeMatchingApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const crimeService = new CrimeService(crimeMatchingApiClient)
  const crimeMatchingResultsService = new CrimeMatchingResultsService(crimeMatchingApiClient)
  const deviceActivationsService = new DeviceActivationsService(crimeMatchingApiClient)
  const hubManagersService = new HubManagersService(crimeMatchingApiClient)
  const validationService = new ValidationService(deviceActivationsService)
  const personsService = new PersonsService(crimeMatchingApiClient)
  const policeDataService = new PoliceDataService(crimeMatchingApiClient)
  const playwrightBrowserService = new PlaywrightBrowserService()

  return {
    applicationInfo,
    auditService,
    crimeService,
    crimeMatchingResultsService,
    deviceActivationsService,
    hubManagersService,
    personsService,
    policeDataService,
    playwrightBrowserService,
    validationService,
  }
}

export type Services = ReturnType<typeof services>
