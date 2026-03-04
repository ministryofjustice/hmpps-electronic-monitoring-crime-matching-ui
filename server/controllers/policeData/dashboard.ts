import { RequestHandler } from 'express'
import dayjs from 'dayjs'
import {
  policeDataDashboardExportQuerySchema,
  policeDataDashboardQuerySchema,
} from '../../schemas/policeData/dashboard'
import CrimeMatchingResultsService from '../../services/crimeMatchingResultsService'
import PoliceDataService from '../../services/policeDataService'
import presentIngestionAttemptSummaries from '../../presenters/ingestionAttemptSummaries'
import generateCrimeMatchingResultExport from '../../presenters/reports/crimeMatchingResults'

export default class PoliceDataDashboardController {
  constructor(
    private readonly policeDataService: PoliceDataService,
    private readonly crimeMatchingResultsService: CrimeMatchingResultsService,
  ) {}

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

  export: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { batchIds } = policeDataDashboardExportQuerySchema.parse(req.query)
    const result = await this.crimeMatchingResultsService.getCrimeMatchingResultsForBatches(username, batchIds)

    if (result.ok) {
      const now = dayjs().format('YYYYMMDDHHmmss')
      const csvData = generateCrimeMatchingResultExport(result.data)
      const fileName = `crime-matching-results-${now}.csv`

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      res.send(csvData)
    } else {
      next(new Error(result.validationErrors.batchIds || result.error))
    }
  }
}
