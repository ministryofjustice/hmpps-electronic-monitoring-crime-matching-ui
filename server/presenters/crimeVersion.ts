import CrimeVersion from "../types/crimeVersion"

const getVersionColour = (crimeVersion: CrimeVersion) => {
  if (crimeVersion.versionLabel === 'Latest version') {
    return 'green'
  }

  return 'grey'
}

const presentCrimeVersion = (crimeVersion: CrimeVersion) => {
    return {
        ...crimeVersion,
        versionColour: getVersionColour(crimeVersion)
    }
}

export default presentCrimeVersion