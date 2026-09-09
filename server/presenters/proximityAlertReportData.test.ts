import { CrimeVersion } from '../types/crimeVersion'
import HubManager from '../types/hubManager'
import presentProximityAlertReportData from './proximityAlertReportData'

const crimeVersion: CrimeVersion = {
  batchId: '',
  crimeDateTimeFrom: '',
  crimeDateTimeTo: '',
  crimeReference: '',
  crimeText: '',
  crimeTypeDescription: '',
  crimeTypeId: '',
  crimeVersionId: '',
  latestCrimeVersionId: '',
  latitude: 0.0,
  longitude: 0.0,
  matching: {
    deviceWearers: [
      {
        address: '',
        dateOfBirth: '',
        deviceId: 123456789,
        deviceSerialNumber: '',
        identifier: 'DEVWR0000001',
        name: '',
        nomisId: '',
        pncRef: '',
        positions: [],
      },
    ],
  },
  policeForceArea: '',
  versionLabel: '',
}

const authorisingManager: HubManager = {
  hasSignature: true,
  id: '',
  name: '',
  occupation: '',
}

describe('presentProximityAlertReportData', () => {
  it('should use the identifier as the deviceWearerId', () => {
    expect(
      presentProximityAlertReportData(crimeVersion, {
        authorisingManager,
      }),
    ).toEqual(
      expect.objectContaining({
        matchedDeviceWearers: expect.arrayContaining([expect.objectContaining({ deviceWearerId: 'DEVWR0000001' })]),
      }),
    )
  })
})
