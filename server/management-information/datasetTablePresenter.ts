import type { GovUkTableCell } from '../types/govUk/table'
import type { Dataset, DatasetResult } from './dataset'

type DatasetTable = {
  columns: Array<GovUkTableCell>
  rows: Array<Array<GovUkTableCell>>
}

class DatasetTablePresenter {
  presentResults(dataset: Dataset, result: DatasetResult): DatasetTable {
    const columns = dataset.columns.map(column => ({ text: column.heading }))
    const rows: Array<Array<GovUkTableCell>> = result.rows.map(row =>
      dataset.columns.map(column => ({ text: String(row[column.key] ?? '') })),
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
}

export default DatasetTablePresenter
