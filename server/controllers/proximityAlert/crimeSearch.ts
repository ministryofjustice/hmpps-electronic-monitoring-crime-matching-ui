import { RequestHandler } from 'express'
import { crimeSearchQuerySchema } from '../../schemas/proximityAlert/crimeSearch'
import CrimeService from '../../services/crimeService'

export default class CrimeSearchController {
  constructor(private readonly crimeService: CrimeService) {}

  private getQueryString = (crimeReference: string | null): string => {
    const searchParams = new URLSearchParams({
      ...(crimeReference != null && { crimeReference }),
    })

    return searchParams.toString()
  }

  search: RequestHandler = async (req, res) => {
    const { crimeReference } = crimeSearchQuerySchema.parse(req.body)
    const query = this.getQueryString(crimeReference)

    return res.redirect(303, `/proximity-alert${query ? `?${query}` : ''}`)
  }

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { username } = res.locals.user
    const { crimeReference } = crimeSearchQuerySchema.parse(query)
    const result = await this.crimeService.getCrimeVersions(username, crimeReference)

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
