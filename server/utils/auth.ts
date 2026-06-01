import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Role } from '../constants/roles'

const hasAnyRole =
  (roles: Array<Role>): RequestHandler =>
  (req, res, next) => {
    if (res.locals.user.userRoles.some(role => (roles as Array<string>).includes(role))) {
      next()
    } else {
      next(createHttpError(403, 'Unauthorised'))
    }
  }

export default hasAnyRole
