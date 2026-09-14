import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import presentCrimeVersion from './crimeVersion'
import { CrimeVersion } from '../types/crimeVersion'

dayjs.extend(utc)
dayjs.extend(timezone)

const baseCrimeVersion: CrimeVersion = {
  crimeVersionId: 'crime-version-1',
  latestCrimeVersionId: null,
  crimeReference: 'crimeRef',
  policeForceArea: 'Metropolitan',
  batchId: 'batch1',
  crimeTypeDescription: 'Aggravated Burglary',
  crimeTypeId: 'AB',
  crimeDateTimeFrom: '2025-01-01T00:00:00Z',
  crimeDateTimeTo: '2025-01-01T01:00:00Z',
  crimeText: 'crimeText',
  latitude: 10,
  longitude: 20,
  versionLabel: 'Latest version',
  matching: null,
}

describe('presentCrimeVersion', () => {
  it('passes entryBearing and exitBearing straight through onto every position', () => {
    const crimeVersion: CrimeVersion = {
      ...baseCrimeVersion,
      matching: {
        deviceWearers: [
          {
            address: '1 Test Street',
            dateOfBirth: '1985-10-05',
            deviceId: 1,
            deviceSerialNumber: '123456789',
            identifier: 'DEVWR0000001',
            name: 'wearer-1',
            nomisId: 'nomisId',
            pncRef: 'PNC123',
            positions: [
              {
                capturedDateTime: '2025-01-01T00:00',
                direction: 10,
                entryBearing: 45,
                exitBearing: 90,
                latitude: 10,
                longitude: 20,
                precision: 10,
                sequenceLabel: 'A1',
                speed: 5,
              },
            ],
          },
        ],
      },
    }

    const result = presentCrimeVersion(crimeVersion)

    expect(result.matching?.deviceWearers[0].positions[0]).toMatchObject({
      entryBearing: 45,
      exitBearing: 90,
    })
  })

  it('passes through null entryBearing/exitBearing for a single-position track', () => {
    const crimeVersion: CrimeVersion = {
      ...baseCrimeVersion,
      matching: {
        deviceWearers: [
          {
            address: '1 Test Street',
            dateOfBirth: '1985-10-05',
            deviceId: 1,
            deviceSerialNumber: '123456789',
            identifier: 'DEVWR0000001',
            name: 'wearer-1',
            nomisId: 'nomisId',
            pncRef: 'PNC123',
            positions: [
              {
                capturedDateTime: '2025-01-01T00:00',
                direction: 10,
                entryBearing: null,
                exitBearing: null,
                latitude: 10,
                longitude: 20,
                precision: 10,
                sequenceLabel: 'A1',
                speed: 5,
              },
            ],
          },
        ],
      },
    }

    const result = presentCrimeVersion(crimeVersion)

    expect(result.matching?.deviceWearers[0].positions[0]).toMatchObject({
      entryBearing: null,
      exitBearing: null,
    })
  })

  it('passes through undefined entryBearing/exitBearing when omitted (legacy data)', () => {
    const crimeVersion: CrimeVersion = {
      ...baseCrimeVersion,
      matching: {
        deviceWearers: [
          {
            address: '1 Test Street',
            dateOfBirth: '1985-10-05',
            deviceId: 1,
            deviceSerialNumber: '123456789',
            identifier: 'DEVWR0000001',
            name: 'wearer-1',
            nomisId: 'nomisId',
            pncRef: 'PNC123',
            positions: [
              {
                capturedDateTime: '2025-01-01T00:00',
                direction: 10,
                latitude: 10,
                longitude: 20,
                precision: 10,
                sequenceLabel: 'A1',
                speed: 5,
              },
            ],
          },
        ],
      },
    }

    const result = presentCrimeVersion(crimeVersion)

    expect(result.matching?.deviceWearers[0].positions[0].entryBearing).toBeUndefined()
    expect(result.matching?.deviceWearers[0].positions[0].exitBearing).toBeUndefined()
  })
})
