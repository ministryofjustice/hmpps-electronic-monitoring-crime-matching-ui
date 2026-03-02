import { RequestHandler } from 'express'
import { policeDataDashboardQuerySchema } from '../../schemas/policeData/dashboard'
import PoliceDataService from '../../services/policeDataService'
import presentIngestionAttemptSummaries from '../../presenters/ingestionAttemptSummaries'

export default class PoliceDataDashboardController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  private getQueryString = (batchId: string, policeForceArea: string, fromDate: string, toDate: string): string => {
    const searchParams = new URLSearchParams({
      ...(batchId && { batchId }),
      ...(policeForceArea && { policeForceArea }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    })

    return searchParams.toString()
  }

  search: RequestHandler = async (req, res) => {
    const { batchId, policeForceArea, fromDate, toDate } = policeDataDashboardQuerySchema.parse(req.body)
    const query = this.getQueryString(batchId, policeForceArea, fromDate, toDate)

    return res.redirect(303, `/police-data/dashboard${query ? `?${query}` : ''}`)
  }

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { username } = res.locals.user
    const { batchId, policeForceArea, fromDate, toDate, page } = policeDataDashboardQuerySchema.parse(query)
    const result = await this.policeDataService.getIngestionAttemptSummaries(
      username,
      batchId,
      policeForceArea,
      fromDate,
      toDate,
      page,
    )

    if (result.ok) {
      const paginationHrefPrefix = this.getQueryString(batchId, policeForceArea, fromDate, toDate)

      res.render('pages/policeData/dashboard', {
        batchId,
        policeForceArea,
        fromDate,
        toDate,
        ingestionAttempts: presentIngestionAttemptSummaries(result.data),
        pageCount: result.pageCount,
        pageNumber: result.pageNumber + 1,
        paginationHrefPrefix,
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

  export: RequestHandler = async (req, res) => {}
}
