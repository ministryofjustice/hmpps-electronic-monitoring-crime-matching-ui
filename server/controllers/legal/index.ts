import { RequestHandler } from 'express'

export default class LegalController {
  constructor() {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/legal/index')
  }
}
