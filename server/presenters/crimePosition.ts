import { Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { CrimeVersion } from '../types/crimeVersion'
import { formatDateTime } from '../utils/date'

type CrimePosition = Position & { positionType: 'crime' }

const presentCrimePosition = ({
  batchId,
  crimeReference,
  crimeDateTimeFrom,
  crimeDateTimeTo,
  latitude,
  longitude,
}: CrimeVersion): CrimePosition => {
  const fromDate = formatDateTime(crimeDateTimeFrom, 'DD/MM/YYYY HH:mm')
  const toDate = formatDateTime(crimeDateTimeTo, 'DD/MM/YYYY HH:mm')
  const location = `${latitude}, ${longitude}`

  return {
    positionType: 'crime',
    latitude,
    longitude,
    precision: 100,
    properties: {
      'Crime Ref': crimeReference,
      'Crime Batch': batchId,
      Location: {
        value: location,
        copyValue: location,
      },
      'Crime Window': `${fromDate}\n${toDate}`,
    },
    label: `Crime Ref: ${crimeReference}`,
  }
}

export default presentCrimePosition
