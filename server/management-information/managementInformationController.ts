import { RequestHandler } from 'express'
import DatasetRegistry from './datasetRegistry'

class ManagementInformationController {
  constructor(private readonly registry: DatasetRegistry) {}

  view: RequestHandler = (req, res) => {
    res.render('pages/managementInformation/index', {
      datasets: this.registry.getAll(),
    })
  }
}

export default ManagementInformationController
