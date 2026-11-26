import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import { Dataset, DatasetColumn, DatasetFilter, DatasetQuery, DatasetResult } from '../dataset'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import { formatDateTime } from '../../utils/date'
import { crimeMatchingResultSummaryDatasetSchema } from '../schemas/crimeMatchingResultSummaryDataset'

class CrimeMatchingResultSummary implements Dataset {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  readonly id = 'crime-matching-result-summary'

  readonly title = 'Crime matching result summary'

  readonly description = 'A summary of crime matches per police force and batch'

  readonly filters: Array<DatasetFilter> = ['from', 'to', 'policeForceArea']

  readonly columns: Array<DatasetColumn> = [
    { key: 'policeForceArea', heading: 'Police force area' },
    { key: 'batchId', heading: 'Batch ID' },
    { key: 'automatedMatches', heading: 'Automated matches', format: 'numeric' },
  ]

  defaultQuery = (): DatasetQuery => {
    const today = formatDateTime(new Date().toISOString(), 'DD/MM/YYYY')

    return {
      from: today,
      to: today,
    }
  }

  async retrieve(username: string, query: DatasetQuery): Promise<DatasetResult> {
    const response = await this.crimeMatchingApiClient.getDataset(asSystem(username), this.id, query)
    const parsed = crimeMatchingResultSummaryDatasetSchema.parse(response)

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

export default CrimeMatchingResultSummary
