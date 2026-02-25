import { RequestHandler } from 'express'
import PoliceDataService from '../../services/policeDataService'

export default class PoliceDataIngestionAttemptController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/policeData/ingestionAttempt', {})
  }
}
