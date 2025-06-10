import { RequestHandler } from 'express'
import CrimeBatchesService from '../../services/crimeMapping/crimeBatches'
import { crimeBatchesQuerySchema } from '../../schemas/crimeMapping/crimeBatches'

export default class CrimeBatchesController {
  constructor(private readonly service: CrimeBatchesService) {}

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { token } = res.locals.user

    // Validate request
    const parsedQuery = crimeBatchesQuerySchema.parse(query)

    const queryResults = await this.service.getQuery(token, parsedQuery.queryId)

    res.render('pages/crime-mapping/crimeBatches', {
      crimeBatches: queryResults.data,
    })
  }

  search: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const formData = req.body

    const result = await this.service.createQuery(token, req.body)

    req.session.formData = formData

    if (result.ok) {
      res.redirect(`/crime-mapping/crime-batches?queryId=${encodeURIComponent(result.data.queryExecutionId)}`)
    } else {
      req.session.validationErrors = result.error
      res.redirect('/crime-mapping/crime-batches')
    }
  }
}

// view
// parse session form data into a strongly typed object
// parse session errors into strongly typed object
// parse query into strongly type object
// display validation errors
// display submitted data
// display query results

// search
// parse the form data into strongly typed object
// validate the form data with rules (e.g. min length)
// persist validation errors in session
