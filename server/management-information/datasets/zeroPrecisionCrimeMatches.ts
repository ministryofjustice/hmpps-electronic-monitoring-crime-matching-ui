import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { Dataset, DatasetFilter, DatasetQuery, DatasetResult } from '../dataset'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import { zeroPrecisionCrimeMatchDatasetSchema } from '../schemas/zeroPrecisionCrimeMatchDataset'

class ZeroPrecisionCrimeMatches implements Dataset {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  readonly id = 'zero-precision-crime-matches'

  readonly title = 'Crime matches with zero-precision positions'

  readonly description = 'Crime matches containing one or more positions with a precision value of zero.'

  readonly filters: DatasetFilter[] = ['from', 'to']

  readonly columns = [
    { key: 'policeForceArea', heading: 'Police force area' },
    { key: 'batchId', heading: 'Batch ID' },
    { key: 'crimeReference', heading: 'Crime reference' },
    { key: 'deviceSerialNumber', heading: 'Device serial number' },
    { key: 'matchedAt', heading: 'Matched at' },
    { key: 'zeroPrecisionPositionCount', heading: 'Zero-precision positions' },
  ]

  async retrieve(username: string, query: DatasetQuery): Promise<DatasetResult> {
    const response = await this.crimeMatchingApiClient.getZeroPrecisionCrimeMatchesDataset(
      asSystem(username),
      query.from,
      query.to,
    )
    const parsed = zeroPrecisionCrimeMatchDatasetSchema.parse(response)

    return {
      rows: parsed.data,
    }
  }
}

export default ZeroPrecisionCrimeMatches
