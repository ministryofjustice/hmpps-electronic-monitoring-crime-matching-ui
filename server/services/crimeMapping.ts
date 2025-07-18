import { Location } from '../types/location'

export default class CrimeMappingService {
  constructor() {}

  async getData(): Promise<Array<Location>> {
    return [
      {
        point: { latitude: 51.574865, longitude: 0.060977 },
        confidenceCircle: 100,
        direction: -2.155,
        geolocationMechanism: 1,
        locationRef: 1,
        speed: 1,
        timestamp: '',
        sequenceNumber: 1,
      },
      {
        point: { latitude: 51.574153, longitude: 0.058536 },
        confidenceCircle: 400,
        direction: -1.734,
        geolocationMechanism: 1,
        locationRef: 2,
        speed: 10,
        timestamp: '',
        sequenceNumber: 2,
      },
      {
        point: {
          latitude: 51.573248244162706,
          longitude: 0.05111371418603764,
        },
        confidenceCircle: 600,
        direction: 1.234,
        geolocationMechanism: 1,
        locationRef: 3,
        speed: 0,
        timestamp: '',
        sequenceNumber: 3,
      },
      {
        point: { latitude: 51.574622, longitude: 0.048643 },
        confidenceCircle: 200,
        direction: 0.08,
        geolocationMechanism: 1,
        locationRef: 4,
        speed: 2,
        timestamp: '',
        sequenceNumber: 4,
      },
      {
        point: { latitude: 51.57610341773559, longitude: 0.048391168020475 },
        confidenceCircle: 120,
        direction: -1.4,
        geolocationMechanism: 1,
        locationRef: 5,
        speed: 5,
        timestamp: '',
        sequenceNumber: 5,
      },
      {
        point: { latitude: 51.576400900843375, longitude: 0.045439341454295505 },
        confidenceCircle: 50,
        direction: -0.784,
        geolocationMechanism: 1,
        locationRef: 6,
        speed: 6,
        timestamp: '',
        sequenceNumber: 6,
      },
    ]
  }
}
