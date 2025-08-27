import DeviceActivation from '../../types/entities/deviceActivation'
import Position from '../../types/entities/position'
import { formatDate } from '../../utils/date'
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
  deviceActivation: DeviceActivation,
  position: Position,
  index: number,
  condensed: boolean,
): Array<string> => {
  const condensedColumns = [
    formatDate(position.timestamp),
    position.point.latitude.toString(),
    position.point.longitude.toString(),
    position.confidenceCircle.toString(),
    position.speed.toString(),
    radToDeg(position.direction).toString(),
    (index + 1).toString(),
  ]
  const fullColumns = [
    deviceActivation.deviceId.toString(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ...condensedColumns,
  ]

  if (condensed) {
    return condensedColumns
  }

  return fullColumns
}

const getRows = (
  deviceActivation: DeviceActivation,
  positions: Array<Position>,
  condensed: boolean,
): Array<Array<string>> => {
  return positions.map((position, index) => getRow(deviceActivation, position, index, condensed))
}

const generateLocationDataReport = (
  deviceActivation: DeviceActivation,
  positions: Array<Position>,
  condensed: boolean,
): string => {
  const data = [getHeaders(condensed), ...getRows(deviceActivation, positions, condensed)]

  return data.map(row => row.join(',')).join('\n')
}

export default generateLocationDataReport
