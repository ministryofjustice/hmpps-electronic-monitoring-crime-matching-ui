import CrimeVersionSummary from '../types/crimeVersionSummary'
import presentCrimeVersionSummaries from './crimeVersionSummary'

const buildCrimeVersionSummary = (overrides: Partial<CrimeVersionSummary> = {}): CrimeVersionSummary => ({
  crimeVersionId: 'crime-version-id',
  crimeReference: '01/7298583/25',
  policeForceArea: 'HMP',
  crimeType: 'BOTD',
  crimeDate: '2025-03-15T00:00',
  batchId: 'HAM20251030',
  ingestionDateTime: '2025-10-30T04:03:01',
  matched: true,
  versionLabel: 'Latest version',
  updates: 'NA',
  ...overrides,
})

describe('presentCrimeVersionSummaries', () => {
  it('marks the first row as the group head', () => {
    const result = presentCrimeVersionSummaries([buildCrimeVersionSummary()])

    expect(result[0].isGroupHead).toEqual(true)
    expect(result[0].groupSize).toEqual(1)
  })

  it('groups consecutive versions of the same crime reference and police force area', () => {
    const result = presentCrimeVersionSummaries([
      buildCrimeVersionSummary({ versionLabel: 'Latest version' }),
      buildCrimeVersionSummary({ versionLabel: 'Version 1' }),
    ])

    expect(result[0].isGroupHead).toEqual(true)
    expect(result[0].groupSize).toEqual(2)
    expect(result[1].isGroupHead).toEqual(false)
    expect(result[1].groupSize).toEqual(1)
  })

  it('starts a new group when the police force area changes', () => {
    const result = presentCrimeVersionSummaries([
      buildCrimeVersionSummary({ policeForceArea: 'HMP', versionLabel: 'Version 1' }),
      buildCrimeVersionSummary({ policeForceArea: 'HRT', versionLabel: 'Latest version' }),
    ])

    expect(result[0].isGroupHead).toEqual(true)
    expect(result[0].groupSize).toEqual(1)
    expect(result[1].isGroupHead).toEqual(true)
    expect(result[1].groupSize).toEqual(1)
  })

  it('starts a new group when the crime reference changes', () => {
    const result = presentCrimeVersionSummaries([
      buildCrimeVersionSummary({ crimeReference: '01/7298583/25', versionLabel: 'Version 1' }),
      buildCrimeVersionSummary({ crimeReference: '02/1234567/25', versionLabel: 'Latest version' }),
    ])

    expect(result[0].isGroupHead).toEqual(true)
    expect(result[1].isGroupHead).toEqual(true)
  })

  it('groups more than two consecutive versions of the same crime', () => {
    const result = presentCrimeVersionSummaries([
      buildCrimeVersionSummary({ versionLabel: 'Latest version' }),
      buildCrimeVersionSummary({ versionLabel: 'Version 2' }),
      buildCrimeVersionSummary({ versionLabel: 'Version 1' }),
    ])

    expect(result[0].isGroupHead).toEqual(true)
    expect(result[0].groupSize).toEqual(3)
    expect(result[1].isGroupHead).toEqual(false)
    expect(result[2].isGroupHead).toEqual(false)
  })
})
