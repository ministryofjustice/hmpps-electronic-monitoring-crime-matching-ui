import { Request, RequestHandler, Response } from 'express'
import SubjectService from '../services/subjectService'
import SubjectSearchCriteriaValidator from '../utils/validators/subjectSearchCriteriaValidator'
import { ParsedSubjectSearchFormInputModel } from '../models/subjectSearchFormInput'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  getSearchResults: RequestHandler = async (req: Request, res: Response) => {
    const queryExecutionId = req.query.search_id as string

    if (!queryExecutionId) {
      res.render('pages/subject/index')
      return
    }

    const subjects = await this.service.getSearchResults(queryExecutionId, res.locals.user.token)

    res.render('pages/subject/index', { subjects })
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
    res.redirect(`/subjects?search_id=${encodeURIComponent(data.queryExecutionId)}`)
  }
}
