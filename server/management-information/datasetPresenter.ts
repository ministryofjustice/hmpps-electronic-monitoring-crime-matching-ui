import { formatDateTime } from '../utils/date'
import type { Dataset, DatasetColumnFormat, DatasetResult } from './dataset'

class DatasetPresenter {
  present(dataset: Dataset, result: Omit<DatasetResult, 'pagination'>) {
    return {
      headings: dataset.columns.map(column => column.heading),
      rows: result.rows.map(row => dataset.columns.map(column => this.formatValue(row[column.key], column.format))),
    }
  }

  private formatValue(value: string | number | null | undefined, format?: DatasetColumnFormat): string {
    if (value == null || value === '') {
      return ''
    }

    if (typeof value === 'string' && format === 'datetime') {
      return formatDateTime(value, 'DD/MM/YYYY, HH:mm:ss')
    }

    return String(value)
  }
}

export default DatasetPresenter
