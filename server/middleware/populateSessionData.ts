import { NextFunction, Request, Response } from 'express'
import { flattenErrorsToMap } from '../utils/errors'

// Automatically exposes validation errors present in the session to the view engine
// Automatically exposes formData present in the session to the view engine
// Transforms list of errors to a dictionary to make access easier in nunjucks templates
const populateSessionData = async (req: Request, res: Response, next: NextFunction) => {
  const validationErrors = req.session.validationErrors || []
  const formData = req.session.formData || {}

  delete req.session.validationErrors
  delete req.session.formData

  res.locals.formData = formData
  res.locals.errors = flattenErrorsToMap(validationErrors)

  next()
}

export default populateSessionData
