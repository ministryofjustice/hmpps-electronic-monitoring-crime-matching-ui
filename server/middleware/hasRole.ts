import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Role } from '../constants/roles'

const hasRole =
  (role: Role): RequestHandler =>
  (req, res, next) => {
    if (res.locals.user.userRoles.includes(role)) {
      next()
    } else {
      next(createHttpError(403, 'Unauthorised'))
    }
  }

export default hasRole
