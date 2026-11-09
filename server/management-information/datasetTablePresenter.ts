import type { GovUkTableCell } from '../types/govUk/table'
import { formatDateTime } from '../utils/date'
import type { Dataset, DatasetColumnFormat, DatasetResult } from './dataset'

type DatasetTable = {
  columns: Array<GovUkTableCell>
  rows: Array<Array<GovUkTableCell>>
}

class DatasetTablePresenter {
  presentResults(dataset: Dataset, result: DatasetResult): DatasetTable {
    const columns = dataset.columns.map(column => ({ text: column.heading }))
    const rows: Array<Array<GovUkTableCell>> = result.rows.map(row =>
      dataset.columns.map(column => ({ text: this.formatValue(row[column.key], column.format) })),
    )

    if (rows.length === 0) {
      rows.push([
        {
          text: 'No results found for applied filters.',
          colspan: dataset.columns.length,
        },
      ])
    }

    return {
      columns,
      rows,
    }
  }

  private formatValue(value: string | number | null | undefined, format?: DatasetColumnFormat): string {
    if (value == null || value === undefined) {
      return ''
    }

    if (typeof value === 'string' && format === 'datetime') {
      return formatDateTime(value, 'DD/MM/YYYY, HH:mm:ss')
    }

    return String(value)
  }
}

export default DatasetTablePresenter
