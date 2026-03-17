import { RequestHandler } from 'express'
import PoliceDataService from '../../services/policeDataService'
import presentIngestionAttempt from '../../presenters/ingestionAttempt'

export default class PoliceDataIngestionAttemptController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { ingestionAttemptId } = req.params
    const result = await this.policeDataService.getIngestionAttempt(username, ingestionAttemptId)

    if (result.ok) {
      res.render('pages/policeData/ingestionAttempt', {
        ingestionAttempt: presentIngestionAttempt(result.data),
      })
    } else {
      next(new Error('Not Found'))
    }
  }
}
