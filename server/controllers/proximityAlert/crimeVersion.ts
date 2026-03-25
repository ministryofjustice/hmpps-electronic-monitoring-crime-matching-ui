import { RequestHandler } from 'express'
import createError from 'http-errors'
import CrimeService from '../../services/crimeService'

export default class CrimeVersionController {
  constructor(private readonly crimeService: CrimeService) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

    if (result.ok) {
      res.render('pages/proximityAlert/crimeVersion', {
        crimeVersion: result.data,
      })
    } else {
      next(createError(404, 'Not found'))
    }
  }
}
