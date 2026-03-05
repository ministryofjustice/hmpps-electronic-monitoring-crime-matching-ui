import { RequestHandler } from 'express'
import crimeSearchQuerySchema from '../../schemas/proximityAlert/crimeSearch'
import CrimeService from '../../services/crimeService'

export default class CrimeSearchController {
  constructor(private readonly crimeService: CrimeService) {}

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { crimeReference } = crimeSearchQuerySchema.parse(query)
    const result = await this.crimeService.getCrimes(crimeReference)

    if (result.ok) {
      res.render('pages/proximityAlert/crimeSearch', {
        crimeReference,
        crimes: result.data,
        pageCount: result.pageCount,
        pageNumber: result.pageNumber,
        validationErrors: {},
      })
    } else {
      res.render('pages/proximityAlert/crimeSearch', {
        crimeReference,
        crimes: [],
        pageCount: 1,
        pageNumber: 1,
        validationErrors: result.validationErrors,
      })
    }
  }
}
