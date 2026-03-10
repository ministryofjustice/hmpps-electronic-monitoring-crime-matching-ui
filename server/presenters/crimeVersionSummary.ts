import CrimeVersionSummary from '../types/crimeVersionSummary'
import presentPoliceForceArea from './policeForceArea'

const getMatchedText = (crimeVersionSummary: CrimeVersionSummary) => {
  return crimeVersionSummary.matched ? 'Yes' : 'No'
}

const getVersionColour = (crimeVersionSummary: CrimeVersionSummary) => {
  if (crimeVersionSummary.versionLabel === 'Latest version') {
    return 'green'
  }

  return 'grey'
}

const presentCrimeVersionSummary = (crimeVersionSummary: CrimeVersionSummary) => {
  return {
    ...crimeVersionSummary,
    matchedText: getMatchedText(crimeVersionSummary),
    policeForceArea: presentPoliceForceArea(crimeVersionSummary.policeForceArea),
    versionColour: getVersionColour(crimeVersionSummary),
    updates: crimeVersionSummary.updates.split(', ').join('</br>'),
  }
}

const presentCrimeVersionSummaries = (crimeVersionSummaries: Array<CrimeVersionSummary>) => {
  return crimeVersionSummaries.map(presentCrimeVersionSummary)
}

export default presentCrimeVersionSummaries
