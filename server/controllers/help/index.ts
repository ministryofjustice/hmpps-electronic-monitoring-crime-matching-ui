import { RequestHandler } from 'express'

export default class HelpController {
  constructor() {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/help/index')
  }
}
