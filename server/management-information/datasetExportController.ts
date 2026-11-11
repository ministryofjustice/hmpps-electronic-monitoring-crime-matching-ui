import type { RequestHandler } from 'express'
import createError from 'http-errors'
import DatasetRegistry from './datasetRegistry'
import DatasetQueryParser from './datasetQueryParser'
import DatasetExportPresenter from './datasetExportPresenter'

class DatasetExportController {
  private readonly queryParser = new DatasetQueryParser()

  private readonly presenter = new DatasetExportPresenter()

  constructor(private readonly registry: DatasetRegistry) {}

  export: RequestHandler = async (req, res, next) => {
    const dataset = this.registry.get(req.params.id)

    if (!dataset) {
      next()
      return
    }

    const { page, format, ...filters } = req.query

    if (format !== 'csv' && format !== 'tsv') {
      next(createError(400, 'Invalid export format'))
      return
    }

    const queryResult = this.queryParser.parse(filters, dataset.filters)

    if (!queryResult.ok) {
      next(createError(400, 'Invalid filters'))
      return
    }

    const result = await dataset.retrieve(res.locals.user.username, queryResult.data)

    if (format === 'tsv') {
      res.type('text/tab-separated-values')
      res.send(this.presenter.toTsv(dataset, result))
      return
    }

    res.attachment(`${dataset.id}-${new Date().toISOString().slice(0, 10)}.csv`)
    res.type('text/csv')
    res.send(this.presenter.toCsv(dataset, result))
  }
}

export default DatasetExportController
