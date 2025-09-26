import Position from '../types/entities/position'
import { SortDirection, sortPositionsByTimestamp } from './sort'

const position1: Position = {
  positionId: 1,
  latitude: 123.123,
  longitude: 123.123,
  precision: 10,
  speed: 5,
  direction: 3.14159,
  timestamp: '2025-01-01T00:00:00Z',
  geolocationMechanism: 'GPS',
  sequenceNumber: 1,
}

const position2: Position = {
  positionId: 2,
  latitude: 456.123,
  longitude: 456.123,
  precision: 20,
  speed: 7,
  direction: 3.66519,
  timestamp: '2025-01-01T00:01:00Z',
  geolocationMechanism: 'GPS',
  sequenceNumber: 2,
}

describe('sortPositionsByTimestamp', () => {
  it('should sort positions in ascending order', () => {
    expect([position2, position1].sort(sortPositionsByTimestamp(SortDirection.ASC))).toEqual([position1, position2])
  })

  it('should sort positions in descending order', () => {
    expect([position1, position2].sort(sortPositionsByTimestamp(SortDirection.DESC))).toEqual([position2, position1])
  })
})
