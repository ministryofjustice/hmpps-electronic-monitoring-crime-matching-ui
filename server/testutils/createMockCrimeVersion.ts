import { CrimeVersion, DeviceWearer, Matching } from '../types/crimeVersion'

const createMockDeviceWearer = (overrides: Partial<DeviceWearer> = {}): DeviceWearer => ({
  address: '',
  dateOfBirth: '',
  deviceId: 123456789,
  deviceSerialNumber: '',
  identifier: 'DEVWR0000001',
  name: 'Test device wearer',
  nomisId: 'A0000XX',
  pncRef: '0000/0000000R',
  positions: [],
  ...overrides,
})

const createMockMatchingResult = (overrides: Partial<Matching> = {}): Matching => ({
  deviceWearers: [createMockDeviceWearer()],
  ...overrides,
})

const createMockCrimeVersion = (overrides: Partial<CrimeVersion> = {}): CrimeVersion => ({
  batchId: 'MPS20260101',
  crimeDateTimeFrom: '2026-01-01T00:00:00Z',
  crimeDateTimeTo: '2026-01-01T00:00:00Z',
  crimeReference: '01/0000000/26',
  crimeText: 'Crime description',
  crimeTypeDescription: 'Aggravated Burglary',
  crimeTypeId: 'AB',
  crimeVersionId: '00000000-0000-4000-8000-000000000001',
  latestCrimeVersionId: '00000000-0000-4000-8000-000000000002',
  latitude: 0.0,
  longitude: 0.0,
  matching: createMockMatchingResult(),
  policeForceArea: 'METROPOLITAN',
  versionLabel: 'Latest version',
  ...overrides,
})

export { createMockCrimeVersion, createMockDeviceWearer, createMockMatchingResult }
