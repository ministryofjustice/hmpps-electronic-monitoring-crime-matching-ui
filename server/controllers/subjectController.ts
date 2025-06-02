import { Request, RequestHandler, Response } from 'express'
import SubjectService from '../services/subjectService'
import SubjectSearchCriteriaValidator from '../utils/validators/subjectSearchCriteriaValidator'
import { ParsedSubjectSearchFormInputModel } from '../models/subjectSearchFormInput'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  getSearchResults: RequestHandler = async (req: Request, res: Response) => {
    const queryExecutionId = req.query.search_id as string
    const page = parseInt(req.query.page as string, 10) || 1

    if (!queryExecutionId) {
      res.render('pages/subject/index')
      return
    }

    const pageResults = await this.service.getSearchResults(queryExecutionId, res.locals.user.token, page)
    const baseUrl = `/location-data/subjects?search_id=${queryExecutionId}`

    const previous = page > 1 ? { href: `${baseUrl}&page=${page - 1}` } : null

    const next = page < pageResults.totalPages ? { href: `${baseUrl}&page=${page + 1}` } : null

    const items = Array.from({ length: pageResults.totalPages }, (_, i) => {
      const number = i + 1
      return {
        number,
        current: number === page,
        href: `${baseUrl}&page=${number}`,
      }
    })

    const paginationData = {
      previous: { previous },
      next: { next },
      items,
    }

    res.render('pages/subject/index', { pageResults, paginationData })
  }

  submitSearch: RequestHandler = async (req: Request, res: Response) => {
    const validatedFormData = ParsedSubjectSearchFormInputModel.parse(req.body)
    const validationErrors = SubjectSearchCriteriaValidator.validateInput(validatedFormData)

    if (validationErrors.length > 0) {
      const errorSummaryList: { text: string; href: string }[] = []
      validationErrors.map(error =>
        errorSummaryList.push({
          text: error.message,
          href: '/',
        }),
      )
      res.render('pages/subject/index', { errorSummaryList })
      return
    }

    const data = await this.service.submitSearchQuery(req.body, res.locals.user.token)
    res.redirect(`/location-data/subjects?search_id=${encodeURIComponent(data.queryExecutionId)}`)
  }
}
