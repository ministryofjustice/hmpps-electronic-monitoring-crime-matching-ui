import { RequestHandler } from 'express'
import createError from 'http-errors'
import CrimeService from '../../services/crimeService'
import presentCrimeVersion from '../../presenters/crimeVersion'
import toProximityAlertMapPositions from '../../presenters/proximityAlert/mapPositions'

export default class CrimeVersionController {
  constructor(private readonly crimeService: CrimeService) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

    if (result.ok) {
      res.render('pages/proximityAlert/crimeVersion', {
        crimeVersion: presentCrimeVersion(result.data),
        positions: toProximityAlertMapPositions(result.data),
      })
    } else {
      next(createError(404, 'Not found'))
    }
  }
}
