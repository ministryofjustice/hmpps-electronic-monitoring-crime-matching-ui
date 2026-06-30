const crimeVersionId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'

const hubManager = {
  id: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
  name: 'Test manager 1',
  hasSignature: true,
}

const crimeLocation = [-2.528865717, 53.43157277]
const deviceLocation = [-2.5282, 53.43159]

const crimeVersion = {
  crimeVersionId,
  latestCrimeVersionId: null,
  crimeReference: 'crimeRef',
  policeForceArea: 'Metropolitan',
  batchId: 'batch1',
  crimeTypeDescription: 'Aggravated Burglary',
  crimeTypeId: 'AB',
  crimeDateTimeFrom: '2025-01-01T00:00:00Z',
  crimeDateTimeTo: '2025-01-01T01:00:00Z',
  crimeText: 'crimeText',
  longitude: crimeLocation[0],
  latitude: crimeLocation[1],
  versionLabel: 'Latest version',
}

const matchedDeviceWearer1 = {
  name: 'wearer-1',
  address: '1 Test Street',
  dateOfBirth: '1985-10-05',
  pncRef: 'PNC123',
  deviceId: 1,
  nomisId: 'nomisId',
  positions: [
    {
      capturedDateTime: '2025-01-01T00:00',
      direction: 10,
      longitude: deviceLocation[0],
      latitude: deviceLocation[1],
      precision: 10,
      sequenceLabel: 'A1',
      speed: 10,
    },
  ],
}

const matchedDeviceWearer2 = {
  name: 'wearer-2',
  address: '2 Test Street',
  dateOfBirth: '1985-10-05',
  deviceId: 2,
  nomisId: 'nomisId2',
  pncRef: 'PNC456',
  positions: [
    {
      capturedDateTime: '2025-01-01T00:00',
      direction: 10,
      longitude: -2.528865717,
      latitude: 53.43157277,
      precision: 10,
      sequenceLabel: 'A1',
      speed: 10,
    },
  ],
}

const crimeVersionWithOneMatch = {
  ...crimeVersion,
  matching: {
    deviceWearers: [matchedDeviceWearer1],
  },
}

const crimeVersionWithManyMatches = {
  ...crimeVersion,
  matching: {
    deviceWearers: [matchedDeviceWearer1, matchedDeviceWearer2],
  },
}

const crimeVersionWithZeroMatches = {
  ...crimeVersion,
  matching: {
    deviceWearers: [],
  },
}

const crimeVersionAwaitingMatching = {
  ...crimeVersion,
  matching: null,
}

const crimeVersionWithLatestCrimeVersionId = {
  ...crimeVersion,
  versionLabel: 'Version 1',
  latestCrimeVersionId: 'b7e61168-f7ca-4056-8a2d-7db0fd77fb62',
  matching: null,
}

const crimeVersionWithMultipleSequences = {
  ...crimeVersion,
  matching: {
    deviceWearers: [
      {
        ...matchedDeviceWearer1,
        positions: [
          {
            ...matchedDeviceWearer1.positions[0],
            sequenceLabel: 'A1',
          },
          {
            ...matchedDeviceWearer1.positions[0],
            latitude: deviceLocation[1] + 0.001,
            longitude: deviceLocation[0] + 0.001,
            sequenceLabel: 'A2',
          },
          {
            ...matchedDeviceWearer1.positions[0],
            latitude: deviceLocation[1] + 0.002,
            longitude: deviceLocation[0] + 0.002,
            sequenceLabel: 'B1',
          },
          {
            ...matchedDeviceWearer1.positions[0],
            latitude: deviceLocation[1] + 0.003,
            longitude: deviceLocation[0] + 0.003,
            sequenceLabel: 'B2',
          },
        ],
      },
    ],
  },
}

export {
  crimeLocation,
  crimeVersionAwaitingMatching,
  crimeVersionWithOneMatch,
  crimeVersionWithManyMatches,
  crimeVersionWithZeroMatches,
  crimeVersionWithLatestCrimeVersionId,
  crimeVersionId,
  deviceLocation,
  hubManager,
  crimeVersionWithMultipleSequences,
}
