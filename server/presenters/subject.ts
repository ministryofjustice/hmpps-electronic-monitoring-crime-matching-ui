import { convertRadiansToDegrees } from './helpers/formatters'
import Position from '../types/entities/position'
import { formatDateTime } from '../utils/date'
import DeviceActivation from '../types/entities/deviceActivation'
import Person from '../types/entities/person'

export default function presentPositionsWithDeviceInfo(positions: Array<Position>, deviceWearer: Person, deviceActivation: DeviceActivation): Array<Position> {
  return positions.map(position => ({
    ...position,

    // Overlay Template
    overlayTitleTemplateId: 'overlay-title-mdss-location',
    overlayBodyTemplateId: 'overlay-body-mdss-location',

    // Display values
    displayDirection: convertRadiansToDegrees(position.direction),
    displayTimestamp: formatDateTime(position.timestamp, 'DD/MM/YYYY, HH:mm:ss'),

    // Subject information
    subjectName: deviceWearer.name,
    subjectNomisId: deviceWearer.nomisId,
    subjectDeviceId: deviceActivation.deviceId,
    subjectDateOfBirth: formatDateTime(deviceWearer.dateOfBirth, 'DD/MM/YYYY'),
    subjectAddress: deviceWearer.address,
    subjectTagStartDate: formatDateTime(deviceActivation.deviceActivationDate, 'DD/MM/YYYY'),
    subjectTagEndDate: formatDateTime(deviceActivation.deviceDeactivationDate, 'DD/MM/YYYY'),
  }))
}
