import { RequestHandler } from 'express'
import { policeDataDashboardQuerySchema } from '../../schemas/policeData/dashboard'
import PoliceDataService from '../../services/policeDataService'
import presentIngestionAttemptSummaries from '../../presenters/ingestionAttemptSummaries'

export default class PoliceDataDashboardController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  search: RequestHandler = async (req, res) => {
    const { batchId, policeForceArea, fromDate, toDate } = policeDataDashboardQuerySchema.parse(req.body)

    const searchParams = new URLSearchParams({
      ...(batchId && { batchId }),
      ...(policeForceArea && { policeForceArea }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    })

    const query = searchParams.toString()

    return res.redirect(303, `/police-data/dashboard${query ? `?${query}` : ''}`)
  }

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { username } = res.locals.user
    const { batchId, policeForceArea, fromDate, toDate } = policeDataDashboardQuerySchema.parse(query)
    const result = await this.policeDataService.getIngestionAttemptSummaries(
      username,
      batchId,
      policeForceArea,
      fromDate,
      toDate,
    )

    if (result.ok) {
      res.render('pages/policeData/dashboard', {
        batchId,
        policeForceArea,
        fromDate,
        toDate,
        ingestionAttempts: presentIngestionAttemptSummaries(result.data),
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
