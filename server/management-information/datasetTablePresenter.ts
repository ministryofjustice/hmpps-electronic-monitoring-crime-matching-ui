import type { GovUkTableCell } from '../types/govUk/table'
import type { Dataset, DatasetResult } from './dataset'
import DatasetPresenter from './datasetPresenter'

type DatasetTable = {
  columns: Array<GovUkTableCell>
  rows: Array<Array<GovUkTableCell>>
  pagination: {
    pageCount: number
    currentPage: number
    hrefPrefix: string
  }
}

class DatasetTablePresenter {
  private presenter = new DatasetPresenter()

  presentResults(dataset: Dataset, result: DatasetResult, hrefPrefix: string): DatasetTable {
    const presented = this.presenter.present(dataset, result)
    const columns: GovUkTableCell[] = presented.headings.map(text => ({ text }))
    const rows: GovUkTableCell[][] = presented.rows.map(row => row.map(text => ({ text })))

    if (rows.length === 0) {
      rows.push([
        {
          text: 'No results found for applied filters.',
          colspan: columns.length,
        },
      ])
    }

    return {
      columns,
      rows,
      pagination: {
        pageCount: result.pagination.pageCount,
        currentPage: result.pagination.pageNumber + 1,
        hrefPrefix,
      },
    }
  }
}

export default DatasetTablePresenter
