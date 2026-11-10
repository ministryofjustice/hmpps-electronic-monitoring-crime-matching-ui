import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { Dataset, DatasetColumn, DatasetFilter, DatasetQuery, DatasetResult } from '../dataset'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import { zeroPrecisionCrimeMatchDatasetSchema } from '../schemas/zeroPrecisionCrimeMatchDataset'
import { formatDateTime } from '../../utils/date'

class ZeroPrecisionCrimeMatches implements Dataset {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  readonly id = 'zero-precision-crime-matches'

  readonly title = 'Crime matches with zero-precision positions'

  readonly description = 'Crime matches containing one or more positions with a precision value of zero.'

  readonly filters: DatasetFilter[] = ['from', 'to']

  readonly columns: Array<DatasetColumn> = [
    { key: 'policeForceArea', heading: 'Police force area' },
    { key: 'batchId', heading: 'Batch ID' },
    { key: 'crimeReference', heading: 'Crime reference' },
    { key: 'deviceSerialNumber', heading: 'Device serial number' },
    { key: 'matchedAt', heading: 'Matched at', format: 'datetime' },
    { key: 'zeroPrecisionPositionCount', heading: 'Zero-precision positions' },
  ]

  defaultQuery = (): DatasetQuery => {
    const today = formatDateTime(new Date().toISOString(), 'DD/MM/YYYY')

    return {
      from: today,
      to: today,
    }
  }

  async retrieve(username: string, query: DatasetQuery): Promise<DatasetResult> {
    const response = await this.crimeMatchingApiClient.getZeroPrecisionCrimeMatchesDataset(
      asSystem(username),
      query.from,
      query.to,
      query.page,
    )
    const parsed = zeroPrecisionCrimeMatchDatasetSchema.parse(response)

    return {
      rows: parsed.data,
      pagination: {
        pageCount: parsed.pageCount,
        pageNumber: parsed.pageNumber,
        pageSize: parsed.pageSize,
      },
    }
  }
}

export default ZeroPrecisionCrimeMatches
