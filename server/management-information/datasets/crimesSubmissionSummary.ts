import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import { formatDateTime } from '../../utils/date'
import type { Dataset, DatasetColumn, DatasetFilter, DatasetQuery, DatasetResult } from '../dataset'
import { crimesSubmissionSummaryDatasetSchema } from '../schemas/crimesSubmissionSummaryDataset'

class CrimesSubmissionSummary implements Dataset {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  readonly id = 'crimes-submission-summary'

  readonly title = 'Crimes submission summary'

  readonly description = 'Summary of crime submissions by police force.'

  readonly filters: Array<DatasetFilter> = ['from', 'to', 'policeForceArea']

  readonly columns: Array<DatasetColumn> = [
    { key: 'crimeType', heading: 'Crime type' },
    { key: 'submitted', heading: 'Number of crimes submitted', format: 'numeric' },
    { key: 'ingested', heading: 'Number of crimes ingested', format: 'numeric' },
    { key: 'failed', heading: 'Number of crimes failed ingestion', format: 'numeric' },
    { key: 'notIngestedPercentage', heading: 'Percentage of crimes not ingested', format: 'percentage' },
  ]

  defaultQuery = (): DatasetQuery => {
    const now = new Date()

    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0))

    return {
      from: formatDateTime(firstDay.toISOString(), 'DD/MM/YYYY'),
      to: formatDateTime(lastDay.toISOString(), 'DD/MM/YYYY'),
    }
  }

  async retrieve(username: string, query: DatasetQuery): Promise<DatasetResult> {
    const response = await this.crimeMatchingApiClient.getCrimesSubmissionSummaryDataset(
      asSystem(username),
      query.policeForceArea,
      query.from,
      query.to,
      query.page,
    )
    const parsed = crimesSubmissionSummaryDatasetSchema.parse(response)

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

export default CrimesSubmissionSummary
