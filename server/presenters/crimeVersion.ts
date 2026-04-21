import { CrimeVersion } from '../types/crimeVersion'
import presentCrimePosition from './crimePosition'
import presentDevicePositions from './devicePositions'

const getVersionColour = (crimeVersion: CrimeVersion) => {
  if (crimeVersion.versionLabel === 'Latest version') {
    return 'green'
  }

  return 'grey'
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

  return undefined
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
