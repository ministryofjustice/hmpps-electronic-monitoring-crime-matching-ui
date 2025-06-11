import Location from '../types/location'

export default class CrimeMappingService {
  constructor() {}

  async getData(): Promise<Array<Location>> {
    return [
      { latitude: 51.574865, longitude: 0.060977, confidence: 100, direction: -2.155 },
      { latitude: 51.574153, longitude: 0.058536, confidence: 400, direction: -1.734 },
      { latitude: 51.573248244162706, longitude: 0.05111371418603764, confidence: 600, direction: 1.234 },
      { latitude: 51.574622, longitude: 0.048643, confidence: 200, direction: 0.08 },
      { latitude: 51.57610341773559, longitude: 0.048391168020475, confidence: 120, direction: -1.4 },
      { latitude: 51.576400900843375, longitude: 0.045439341454295505, confidence: 50, direction: -0.784 },
    ]
  }
}
