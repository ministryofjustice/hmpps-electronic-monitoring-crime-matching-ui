import { RequestHandler } from 'express'
import DatasetRegistry from './datasetRegistry'
import DatasetQueryParser from './datasetQueryParser'

class DatasetController {
  private queryParser = new DatasetQueryParser()

  constructor(private readonly registry: DatasetRegistry) {}

  view: RequestHandler = (req, res, next) => {
    const dataset = this.registry.get(req.params.id)

    if (!dataset) {
      next()
      return
    }

    const queryResult = this.queryParser.parse(req.query, dataset.filters)

    res.render('pages/managementInformation/dataset', {
      dataset,
      validationErrors: queryResult.ok ? undefined : queryResult.error,
      from: typeof req.query.from === 'string' ? req.query.from : '',
      to: typeof req.query.to === 'string' ? req.query.to : '',
      policeForceArea: typeof req.query.policeForceArea === 'string' ? req.query.policeForceArea : '',
    })
  }
}

export default DatasetController
