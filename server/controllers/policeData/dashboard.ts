import { RequestHandler } from 'express'
import policeDataDashboardQuerySchema from '../../schemas/policeData/dashboard'
import PoliceDataService from '../../services/policeDataService'

export default class PoliceDataDashboardController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { batchId, policeForceArea, fromDate, toDate } = policeDataDashboardQuerySchema.parse(query)
    const result = await this.policeDataService.getIngestionAttemptSummaries(batchId, policeForceArea, fromDate, toDate)

    if (result.ok) {
      res.render('pages/policeData/dashboard', {
        batchId,
        policeForceArea,
        fromDate,
        toDate,
        ingestionAttempts: result.data,
        pageCount: result.pageCount,
        pageNumber: result.pageNumber,
        validationErrors: {},
      })
    } else {
      res.render('pages/policeData/dashboard', {
        batchId,
        policeForceArea,
        fromDate,
        toDate,
        ingestionAttempts: [],
        pageCount: 1,
        pageNumber: 1,
        validationErrors: result.validationErrors,
      })
    }
  }
}
