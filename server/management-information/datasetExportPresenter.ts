import { stringify } from 'csv-stringify/sync'
import type { Dataset, DatasetResult } from './dataset'
import DatasetPresenter from './datasetPresenter'

class DatasetExportPresenter {
  private readonly presenter = new DatasetPresenter()

  toCsv(dataset: Dataset, result: Omit<DatasetResult, 'pagination'>): string {
    const { headings, rows } = this.presenter.present(dataset, result)

    return this.stringify([headings, ...rows], ',')
  }

  toTsv(dataset: Dataset, result: Omit<DatasetResult, 'pagination'>): string {
    const { headings, rows } = this.presenter.present(dataset, result)

    return this.stringify([headings, ...rows], '\t')
  }

  private stringify(values: Array<Array<string>>, delimiter: string): string {
    return stringify(values, { escape_formulas: true, delimiter })
  }
}

export default DatasetExportPresenter
