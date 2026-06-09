import { RequestHandler } from 'express'
import PoliceDataService from '../../services/policeDataService'
import presentIngestionAttempt from '../../presenters/ingestionAttempt'
import generateValidationErrorsExport from '../../presenters/reports/validationErrors'
import AuditService, { Page } from '../../services/auditService'

export default class PoliceDataIngestionAttemptController {
  constructor(
    private readonly auditService: AuditService,
    private readonly policeDataService: PoliceDataService
  ) {}

  view: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { ingestionAttemptId } = req.params
    const ingestionAttempt = await this.policeDataService.getIngestionAttempt(username, ingestionAttemptId)

    res.render('pages/policeData/ingestionAttempt', {
      ingestionAttempt: presentIngestionAttempt(ingestionAttempt),
    })
  }

  export: RequestHandler = async (req, res) => {
    await this.auditService.logExport(Page.POLICE_DATA_INGESTION_ATTEMPT, { 
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        params: req.params,
        query: req.query,
      }
    })
    
    const { username } = res.locals.user
    const { ingestionAttemptId } = req.params
    const ingestionAttempt = await this.policeDataService.getIngestionAttempt(username, ingestionAttemptId)

    const csvData = generateValidationErrorsExport(ingestionAttempt.validationErrors)
    const fileName = `validation-errors-${ingestionAttempt.batchId}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send(csvData)
  }
}
