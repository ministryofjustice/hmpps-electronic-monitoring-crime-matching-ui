import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import { Dataset, DatasetColumn, DatasetFilter, type DatasetQuery, DatasetResult } from '../dataset'
import CrimeMatchingClient from '../../data/crimeMatchingClient'
import { formatDateTime } from '../../utils/date'
import { failedCrimeSubmissionsDatasetSchema } from '../schemas/failedCrimeSubmissionsDataset'

class FailedCrimeSubmissions implements Dataset {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  readonly id = 'failed-crime-submissions'

  readonly title = 'Failed crime submissions'

  readonly description = 'A list of failed crime submissions by error type and police force.'

  readonly filters: Array<DatasetFilter> = ['from', 'to', 'policeForceArea']

  readonly columns: Array<DatasetColumn> = [
    { key: 'reasonForFailure', heading: 'Reason for failure' },
    { key: 'failureCount', heading: 'Failure count', format: 'numeric' },
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
    const response = await this.crimeMatchingApiClient.getDataset(asSystem(username), this.id, query)
    const parsed = failedCrimeSubmissionsDatasetSchema.parse(response)

    return {
      rows: parsed.data.flatMap(({ total, failures }) => [
        ...failures,
        { reasonForFailure: 'Total', failureCount: total },
      ]),
      pagination: {
        pageCount: parsed.pageCount,
        pageNumber: parsed.pageNumber,
        pageSize: parsed.pageSize,
      },
    }
  }
}

export default FailedCrimeSubmissions
