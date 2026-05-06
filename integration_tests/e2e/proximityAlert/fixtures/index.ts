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
  crimeReference: 'crimeRef',
  batchId: 'batch1',
  crimeTypeDescription: 'Aggravated Burglary',
  crimeTypeId: 'AB',
  crimeDateTimeFrom: '2025-01-01T00:00:00Z',
  crimeDateTimeTo: '2025-01-01T01:00:00Z',
  crimeText: 'crimeText',
  longitude: crimeLocation[0],
  latitude: crimeLocation[1],
  versionLabel: 'Latest Version',
}

const matchedDeviceWearer1 = {
  name: 'wearer-1',
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
  deviceId: 2,
  nomisId: 'nomisId2',
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

export {
  crimeLocation,
  crimeVersionAwaitingMatching,
  crimeVersionWithOneMatch,
  crimeVersionWithManyMatches,
  crimeVersionWithZeroMatches,
  crimeVersionId,
  deviceLocation,
  hubManager,
}
