import Position from '../types/entities/position'
import { parseDateTimeFromISOString } from './date'

enum SortDirection {
  ASC,
  DESC,
}

const sortPositionsByTimestamp = (sortDirection: SortDirection) => (a: Position, b: Position) => {
  const t1 = parseDateTimeFromISOString(a.timestamp)
  const t2 = parseDateTimeFromISOString(b.timestamp)

  if (sortDirection === SortDirection.ASC) {
    return t1.isBefore(t2) ? -1 : 1
  }

  return t1.isBefore(t2) ? 1 : -1
}

export { sortPositionsByTimestamp, SortDirection }
