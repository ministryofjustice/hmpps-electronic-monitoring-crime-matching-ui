import { RequestHandler } from 'express'
import PoliceDataService from '../../services/policeDataService'
import { type IngestionAttemptDetail } from '../../schemas/policeData/dashboard'
import { type IngestionStatus } from '../../types/ingestionStatus'

const STATUS_CONFIG: Record<IngestionStatus, { text: string; colour: string }> = {
  SUCCESSFUL: { text: 'Successfully ingested', colour: 'green' },
  PARTIAL: { text: 'Partially ingested', colour: 'amber' },
  FAILED: { text: 'Failed ingestion', colour: 'red' },
  ERROR: { text: 'Error', colour: 'red' },
  UNKNOWN: { text: 'Unknown', colour: 'grey' },
}

type IngestionAttemptViewModel = IngestionAttemptDetail & {
  status: string
  statusText: string
  statusColour: string
  matchesText: string | null
}

function toViewModel(ingestionAttempt: IngestionAttemptDetail): IngestionAttemptViewModel {
  const { ingestionStatus } = ingestionAttempt
  return {
    ...ingestionAttempt,
    status: ingestionStatus,
    statusText: STATUS_CONFIG[ingestionStatus].text,
    statusColour: STATUS_CONFIG[ingestionStatus].colour,
    matchesText: ingestionAttempt.matches?.toString() ?? null,
  }
}

export default class PoliceDataIngestionAttemptController {
  constructor(private readonly policeDataService: PoliceDataService) {}

  view: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { ingestionAttemptId } = req.params
    const dashboardQueryString = (req.query.returnTo as string) ?? null

    const ingestionAttempt = toViewModel(
      (await this.policeDataService.getIngestionAttempt(username, ingestionAttemptId)) as IngestionAttemptDetail,
    )

    res.render('pages/policeData/ingestionAttempt', {
      ingestionAttempt,
      dashboardQueryString,
    })
  }

  exportValidationErrors: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { ingestionAttemptId } = req.params

    const ingestionAttempt = await this.policeDataService.getIngestionAttempt(username, ingestionAttemptId)

    if (!ingestionAttempt.isCrimeBatch) {
      res.status(403).render('page/error', {
        message: 'Validation error...export is only available for crime batches.',
      })
      return
    }

    const csv = await this.policeDataService.getValidationErrorCsv(username, ingestionAttemptId)
    const filename = `validation-errors-${ingestionAttempt.batchId ?? ingestionAttemptId}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  }
}
