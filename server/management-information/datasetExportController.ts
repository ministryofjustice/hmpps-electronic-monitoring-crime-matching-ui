import type { RequestHandler } from 'express'
import createError from 'http-errors'
import DatasetRegistry from './datasetRegistry'
import DatasetQueryParser from './datasetQueryParser'
import DatasetExportPresenter from './datasetExportPresenter'

class DatasetExportController {
  private readonly queryParser = new DatasetQueryParser()

  private readonly presenter = new DatasetExportPresenter()

  constructor(private readonly registry: DatasetRegistry) {}

  download: RequestHandler = async (req, res, next) => {
    const dataset = this.registry.get(req.params.id)

    if (!dataset) {
      next()
      return
    }

    // Exclude pagination so the complete dataset is retrieved.
    const { page, ...filters } = req.query
    const queryResult = this.queryParser.parse(filters, dataset.filters)

    if (!queryResult.ok) {
      next(createError(400, 'Invalid filters'))
      return
    }

    const result = await dataset.retrieve(res.locals.user.username, queryResult.data)
    const csv = this.presenter.toCsv(dataset, result)

    res.attachment(`${dataset.id}-${new Date().toISOString().slice(0, 10)}.csv`)
    res.type('text/csv')
    res.send(csv)
  }
}

export default DatasetExportController
