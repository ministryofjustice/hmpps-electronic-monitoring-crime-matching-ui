import { RequestHandler } from 'express'
import z from 'zod'

const crimeBatchesQuerySchema = z.object({
  searchId: z.string().optional()
})

export default class CrimeBatchesController {
  constructor(private readonly service: CrimeBatchesService) {}


  view: RequestHandler = async (req, res) => {
    const query = crimeBatchesQuerySchema.parse(req.query)
    const queryExecutionId = query.searchId
    const queryResults = await this.service.getResults(queryExecutionId)

    res.render('pages/crime-mapping/crimeBatches', {
      crimeBatches: queryResults.crimeBatches
    })
  }
}
