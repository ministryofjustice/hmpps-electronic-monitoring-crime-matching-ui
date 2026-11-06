import { RequestHandler } from 'express'
import DatasetRegistry from './datasetRegistry'
import DatasetQueryParser from './datasetQueryParser'
import DatasetTablePresenter from './datasetTablePresenter'

class DatasetController {
  private queryParser = new DatasetQueryParser()

  private tablePresenter = new DatasetTablePresenter()

  constructor(private readonly registry: DatasetRegistry) {}

  view: RequestHandler = async (req, res, next) => {
    const dataset = this.registry.get(req.params.id)

    if (!dataset) {
      next()
      return
    }

    const queryResult = this.queryParser.parse(req.query, dataset.filters)
    const result = queryResult.ok && req.query.view === 'true' ? await dataset.retrieve(queryResult.data) : undefined
    const table = result ? this.tablePresenter.presentResults(dataset, result) : undefined

    res.render('pages/managementInformation/dataset', {
      dataset,
      table,
      validationErrors: queryResult.ok ? undefined : queryResult.error,
      from: typeof req.query.from === 'string' ? req.query.from : '',
      to: typeof req.query.to === 'string' ? req.query.to : '',
      policeForceArea: typeof req.query.policeForceArea === 'string' ? req.query.policeForceArea : '',
    })
  }
}

export default DatasetController
