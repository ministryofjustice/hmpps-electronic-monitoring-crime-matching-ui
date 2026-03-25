import { RequestHandler } from 'express'
import CrimeService from '../../services/crimeService'

export default class CrimeVersionController {
  constructor(private readonly crimeService: CrimeService) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

    res.render('pages/proximityAlert/crimeVersion', {
      crimeVersion: result,
    })
  }
}
