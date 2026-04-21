import { Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { CrimeVersion, DeviceWearer } from '../types/crimeVersion'
import { formatDateTime } from '../utils/date'

const getVersionColour = (crimeVersion: CrimeVersion) => {
  if (crimeVersion.versionLabel === 'Latest version') {
    return 'green'
  }

  return 'grey'
}

const presentCrimePosition = ({
  batchId,
  crimeReference,
  crimeDateTimeFrom,
  crimeDateTimeTo,
  latitude,
  longitude,
}: CrimeVersion): Position & Record<string, unknown> => {
  return {
    latitude,
    longitude,
    precision: 100,
    crimeReference,
    overlayTitleTemplateId: 'overlay-title-crime-location',
    overlayBodyTemplateId: 'overlay-body-crime-location',
    batchId,
    crimeDateTimeFrom: formatDateTime(crimeDateTimeFrom, 'DD/MM/YYYY HH:mm'),
    crimeDateTimeTo: formatDateTime(crimeDateTimeTo, 'DD/MM/YYYY HH:mm'),
  }
}

const presentDevicePositions = ({
  deviceId,
  name,
  nomisId,
  positions,
}: DeviceWearer): Array<Position & Record<string, unknown>> => {
  return positions.map(({ capturedDateTime, confidence, latitude, longitude, sequenceLabel }) => {
    return {
      latitude,
      longitude,
      precision: confidence,
      capturedDateTime: formatDateTime(capturedDateTime, 'DD/MM/YYYY HH:mm'),
      deviceId,
      direction: 0,
      name,
      nomisId,
      sequenceLabel,
      speed: 0,
    }
  })
}

const presentMatchingResult = (crimeVersion: CrimeVersion) => {
  if (crimeVersion.matching) {
    return {
      deviceWearers: crimeVersion.matching.deviceWearers.map(deviceWearer => ({
        ...deviceWearer,
        positions: presentDevicePositions(deviceWearer),
      })),
    }
  }

  return null
}

const presentCrimeVersion = (crimeVersion: CrimeVersion) => {
  return {
    ...crimeVersion,
    versionColour: getVersionColour(crimeVersion),
    crimePosition: presentCrimePosition(crimeVersion),
    matching: presentMatchingResult(crimeVersion),
  }
}

export default presentCrimeVersion
