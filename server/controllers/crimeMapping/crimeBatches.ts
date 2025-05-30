import { RequestHandler } from 'express'

export default class CrimeBatchesController {
  constructor() {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/crime-mapping/crimeBatches')
  }
}
