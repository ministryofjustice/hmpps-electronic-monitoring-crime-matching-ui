import { RequestHandler } from 'express'
import { z } from 'zod'
import CrimeBatchesService from '../../services/crimeMapping/crimeBatches'

const crimeBatchesQuerySchema = z.object({
  searchId: z.string().optional(),
})

const crimeBatchesFormData = z.object({
  term: z.string()
})

export default class CrimeBatchesController {
  constructor(private readonly service: CrimeBatchesService) {}

  view: RequestHandler = async (req, res) => {
    const token = res.locals.user.token
    const query = crimeBatchesQuerySchema.parse(req.query)
    const queryExecutionId = query.searchId
    const queryResults = await this.service.getResults(token, queryExecutionId)

    res.render('pages/crime-mapping/crimeBatches', {
      crimeBatches: queryResults.data,
    })
  }

  search: RequestHandler = async (req, res) => {
    const formData = crimeBatchesFormData.parse(req.body)

    res.redirect(`/crime-mapping/crime-batches?search_id=${encodeURIComponent()}`)
  }
}
