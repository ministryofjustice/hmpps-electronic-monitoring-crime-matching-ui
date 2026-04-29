import { RequestHandler } from 'express'
import URLS from '../constants/urls'

const populateConstants: RequestHandler = (req, res, next) => {
  res.locals.URLS = URLS

  next()
}

export default populateConstants
