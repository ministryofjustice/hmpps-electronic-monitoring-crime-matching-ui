import { Position } from '../../../mockApis/locationData/deviceActivationPositions'

const sampleLocations = {
  data: [
    {
      latitude: 51.574865,
      longitude: 0.060977,
      precision: 100,
      direction: -2.155,
      geolocationMechanism: 'GPS',
      positionId: 1,
      speed: 1,
      timestamp: '2025-01-01T00:00:00.000Z',
    },
    {
      latitude: 51.574153,
      longitude: 0.058536,
      precision: 400,
      direction: -1.734,
      geolocationMechanism: 'GPS',
      positionId: 2,
      speed: 10,
      timestamp: '2025-01-01T00:01:00.000Z',
    },
    {
      latitude: 51.573248244162706,
      longitude: 0.05111371418603764,
      precision: 600,
      direction: 1.234,
      geolocationMechanism: 'GPS',
      positionId: 3,
      speed: 0,
      timestamp: '2025-01-01T00:02:00.000Z',
    },
    {
      latitude: 51.574622,
      longitude: 0.048643,
      precision: 200,
      direction: 0.08,
      geolocationMechanism: 'GPS',
      positionId: 4,
      speed: 2,
      timestamp: '2025-01-01T00:03:00.000Z',
    },
    {
      latitude: 51.57610341773559,
      longitude: 0.048391168020475,
      precision: 120,
      direction: -1.4,
      geolocationMechanism: 'GPS',
      positionId: 5,
      speed: 5,
      timestamp: '2025-01-01T00:04:00.000Z',
    },
    {
      latitude: 51.576400900843375,
      longitude: 0.045439341454295505,
      precision: 50,
      direction: -0.784,
      geolocationMechanism: 'GPS',
      positionId: 6,
      speed: 6,
      timestamp: '2025-01-01T00:05:00.000Z',
    },
  ] as Array<Position>,
}

export default sampleLocations
