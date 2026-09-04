import CrimeVersionSummary from '../types/crimeVersionSummary'
import presentPoliceForceArea from './policeForceArea'

const getMatchedText = (crimeVersionSummary: CrimeVersionSummary) => {
  return crimeVersionSummary.matched ? 'Yes' : 'No'
}

const getVersionColour = (crimeVersionSummary: CrimeVersionSummary) => {
  if (crimeVersionSummary.versionLabel.includes('Latest version')) {
    return 'green'
  }

  return 'grey'
}

const isSameCrimeGroup = (a: CrimeVersionSummary, b: CrimeVersionSummary) =>
  a.crimeReference === b.crimeReference && a.policeForceArea === b.policeForceArea

// A crime group is a run of consecutive rows that share the same crime reference
// and police force area - i.e. different versions of the same crime, as opposed
// to a different crime that happens to share a crime reference.
const getCrimeGroupSize = (crimeVersionSummaries: Array<CrimeVersionSummary>, index: number) => {
  let size = 1

  while (
    index + size < crimeVersionSummaries.length &&
    isSameCrimeGroup(crimeVersionSummaries[index], crimeVersionSummaries[index + size])
  ) {
    size += 1
  }

  return size
}

const presentCrimeVersionSummary = (
  crimeVersionSummary: CrimeVersionSummary,
  previousCrimeVersionSummary: CrimeVersionSummary | undefined,
  groupSize: number,
) => {
  const isGroupHead =
    !previousCrimeVersionSummary || !isSameCrimeGroup(crimeVersionSummary, previousCrimeVersionSummary)

  return {
    ...crimeVersionSummary,
    matchedText: getMatchedText(crimeVersionSummary),
    policeForceArea: presentPoliceForceArea(crimeVersionSummary.policeForceArea),
    versionColour: getVersionColour(crimeVersionSummary),
    updates: crimeVersionSummary.updates.split(', ').join('</br>'),
    isGroupHead,
    groupSize: isGroupHead ? groupSize : 1,
  }
}

const presentCrimeVersionSummaries = (crimeVersionSummaries: Array<CrimeVersionSummary>) => {
  return crimeVersionSummaries.map((crimeVersionSummary, index) =>
    presentCrimeVersionSummary(
      crimeVersionSummary,
      crimeVersionSummaries[index - 1],
      getCrimeGroupSize(crimeVersionSummaries, index),
    ),
  )
}

export default presentCrimeVersionSummaries
