import { RequestHandler } from 'express'
import { crimeSearchQuerySchema } from '../../schemas/proximityAlert/crimeSearch'
import CrimeService from '../../services/crimeService'
import presentCrimeVersionSummaries from '../../presenters/crimeVersionSummary'

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
    const { crimeReference, page } = crimeSearchQuerySchema.parse(query)
    const result = await this.crimeService.getCrimeVersions(username, crimeReference, page)

    if (result.ok) {
      const paginationHrefPrefix = this.getQueryString(crimeReference)

      res.render('pages/proximityAlert/crimeSearch', {
        crimeReference,
        crimes: presentCrimeVersionSummaries(result.data),
        paginationHrefPrefix,
        pageCount: result.pageCount,
        pageNumber: result.pageNumber + 1,
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
