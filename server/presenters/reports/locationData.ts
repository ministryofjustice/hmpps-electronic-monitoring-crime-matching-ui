import DeviceActivation from '../../types/entities/deviceActivation'
import Person from '../../types/entities/person'
import Position from '../../types/entities/position'
import { formatDate, formatDob } from '../../utils/date'
import radToDeg from '../../utils/math'

const getHeaders = (condensed: boolean): Array<string> => {
  const condensedHeaders = [
    'DATE/TIME',
    'LATITUDE',
    'LONGITUDE',
    'CONFIDENCE CIRCLE',
    'SPEED',
    'DIRECTION',
    'SEQUENCE NO.',
  ]
  const fullHeaders = [
    'DEVICE ID',
    'DEVICE NAME',
    'SUBJECT IDENTIFIER',
    'PoP NAME',
    'NOMIS ID',
    'PNC REF',
    'PoP ADDRESS',
    'PoP DATE OF BIRTH',
    'PROBATION PRACTITIONER',
    'ORDER START',
    'ORDER END',
    ...condensedHeaders,
  ]

  if (condensed) {
    return condensedHeaders
  }

  return fullHeaders
}

const getRow = (
  deviceWearer: Person,
  deviceActivation: DeviceActivation,
  position: Position,
  index: number,
  condensed: boolean,
): Array<string> => {
  const condensedColumns = [
    formatDate(position.timestamp),
    position.latitude.toString(),
    position.longitude.toString(),
    position.precision.toString(),
    position.speed.toString(),
    radToDeg(position.direction).toString(),
    (index + 1).toString(),
  ]
  const fullColumns = [
    deviceActivation.deviceId.toString(),
    deviceActivation.deviceName,
    deviceWearer.personId.toString(),
    deviceWearer.name,
    deviceWearer.nomisId,
    deviceWearer.pncRef,
    deviceWearer.address,
    formatDob(deviceWearer.dateOfBirth),
    deviceWearer.probationPractitioner,
    formatDate(deviceActivation.orderStart),
    formatDate(deviceActivation.orderEnd),
    ...condensedColumns,
  ]

  if (condensed) {
    return condensedColumns
  }

  return fullColumns
}

const getRows = (
  deviceWearer: Person,
  deviceActivation: DeviceActivation,
  positions: Array<Position>,
  condensed: boolean,
): Array<Array<string>> => {
  return positions.map((position, index) => getRow(deviceWearer, deviceActivation, position, index, condensed))
}

const generateLocationDataReport = (
  deviceWearer: Person,
  deviceActivation: DeviceActivation,
  positions: Array<Position>,
  condensed: boolean,
): string => {
  const data = [getHeaders(condensed), ...getRows(deviceWearer, deviceActivation, positions, condensed)]

  return data.map(row => row.join(',')).join('\n')
}

export default generateLocationDataReport
