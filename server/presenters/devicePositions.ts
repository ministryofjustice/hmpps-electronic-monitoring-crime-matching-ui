import { Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { DeviceWearer } from '../types/crimeVersion'
import { formatDateTime } from '../utils/date'

type DevicePosition = Position & { positionType: 'device' }

const presentDevicePositions = ({ deviceId, name, nomisId, positions }: DeviceWearer): Array<DevicePosition> => {
  return positions.map(({ capturedDateTime, confidence, latitude, longitude, sequenceLabel }) => {
    return {
      positionType: 'device',
      latitude,
      longitude,
      precision: confidence,
      properties: {
        'Confidence (m)': confidence.toString(),
        'Altitude (m)': '0',
        'Speed (km/h)': '0',
        'Direction (degrees)': '0',
        'Geolocation Mechanism': 'Location obtained from GNSS',
        'Recorded Date': formatDateTime(capturedDateTime, 'DD/MM/YYYY HH:mm'),
        Latitude: latitude.toString(),
        Longitude: longitude.toString(),
      },
      label: `Name (NOMIS ID): ${name}(${nomisId})\nDevice ID: ${deviceId}`,
      sequenceLabel,
    }
  })
}

export default presentDevicePositions
