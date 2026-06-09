import { RequestHandler } from 'express'
import { crimeSearchQuerySchema } from '../../schemas/proximityAlert/crimeSearch'
import CrimeService from '../../services/crimeService'
import presentCrimeVersionSummaries from '../../presenters/crimeVersionSummary'
import URLS from '../../constants/urls'
import AuditService, { Page } from '../../services/auditService'

export default class CrimeSearchController {
  constructor(
    private readonly auditService: AuditService,
    private readonly crimeService: CrimeService
  ) {}

  private getQueryString = (crimeReference: string | null): string => {
    const searchParams = new URLSearchParams({
      ...(crimeReference != null && { crimeReference }),
    })

    return searchParams.toString()
  }

  search: RequestHandler = async (req, res) => {
    await this.auditService.logSearch(Page.PROXIMITY_ALERT_CRIME_VERSIONS, { 
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        params: req.params,
        query: req.query,
      }
    })
    
    const { crimeReference } = crimeSearchQuerySchema.parse(req.body)
    const query = this.getQueryString(crimeReference)

    return res.redirect(303, `${URLS.PROXIMITY_ALERT.CRIME_VERSIONS.VIEW}${query ? `?${query}` : ''}`)
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
