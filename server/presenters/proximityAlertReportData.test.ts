import { createMockCrimeVersion } from '../testutils/createMockCrimeVersion'
import createMockAuthorisingManager from '../testutils/createMockAuthorisingManager'
import presentProximityAlertReportData from './proximityAlertReportData'

describe('presentProximityAlertReportData', () => {
  it('should use the identifier as the deviceWearerId', () => {
    expect(
      presentProximityAlertReportData(createMockCrimeVersion(), {
        authorisingManager: createMockAuthorisingManager(),
      }),
    ).toEqual(
      expect.objectContaining({
        matchedDeviceWearers: expect.arrayContaining([expect.objectContaining({ deviceWearerId: 'DEVWR0000001' })]),
      }),
    )
  })
})
