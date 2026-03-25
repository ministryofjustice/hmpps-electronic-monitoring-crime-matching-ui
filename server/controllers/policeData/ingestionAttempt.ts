import { RequestHandler } from 'express'
import PoliceDataService from '../../services/policeDataService'
import presentIngestionAttempt from '../../presenters/ingestionAttempt'
import { policeDataIngestionAttemptQuerySchema } from '../../schemas/policeData/ingestionAttempt'
import generateValidationErrorsExport from '../../presenters/reports/validationErrors'

export default class PoliceDataIngestionAttemptController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  view: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { ingestionAttemptId } = req.params
    const { returnTo } = policeDataIngestionAttemptQuerySchema.parse(req.query)
    const ingestionAttempt = await this.policeDataService.getIngestionAttempt(username, ingestionAttemptId)

    res.render('pages/policeData/ingestionAttempt', {
      ingestionAttempt: presentIngestionAttempt(ingestionAttempt),
      backLink: returnTo,
    })
  }

  export: RequestHandler = async (req, res) => {
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
