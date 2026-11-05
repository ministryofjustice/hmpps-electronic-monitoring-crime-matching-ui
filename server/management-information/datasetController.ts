import { RequestHandler } from 'express'
import DatasetRegistry from './datasetRegistry'

class DatasetController {
  constructor(private readonly registry: DatasetRegistry) {}

  view: RequestHandler = (req, res, next) => {
    const dataset = this.registry.get(req.params.id)

    if (dataset) {
      res.render('pages/managementInformation/dataset', {
        dataset,
      })
    } else {
      next()
    }
  }
}

export default DatasetController
