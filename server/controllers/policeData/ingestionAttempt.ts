import { RequestHandler } from 'express'
import PoliceDataService from '../../services/policeDataService'
import presentIngestionAttempt from '../../presenters/ingestionAttempt'
import { policeDataIngestionAttemptQuerySchema } from '../../schemas/policeData/ingestionAttempt'

export default class PoliceDataIngestionAttemptController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { ingestionAttemptId } = req.params
    const { returnTo } = policeDataIngestionAttemptQuerySchema.parse(req.query)
    const ingestionAttempt = await this.policeDataService.getIngestionAttempt(username, ingestionAttemptId)

    res.render('pages/policeData/ingestionAttempt', {
      ingestionAttempt: presentIngestionAttempt(ingestionAttempt),
      backLink: returnTo,
    })
  }
}
