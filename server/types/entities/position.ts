type Point = {
  latitude: number
  longitude: number
}

type Position = {
  locationRef: number
  point: Point
  confidenceCircle: number
  speed: number
  direction: number
  timestamp: string
  geolocationMechanism: number
  sequenceNumber: number
}

export default Position
