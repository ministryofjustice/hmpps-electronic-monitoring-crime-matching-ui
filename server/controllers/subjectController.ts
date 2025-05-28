import { Request, RequestHandler, Response } from 'express'
import SubjectService from '../services/subjectService'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  getSearchResults: RequestHandler = async (req: Request, res: Response) => {
    const queryExecutionId = req.query.search_id as string

    if (!queryExecutionId) {
      res.render('pages/subject/index')
      return
    }

    const data = await this.service.getSearchResults(queryExecutionId, res.locals.user.token)

    res.render('pages/subject/index', { data })
  }

  submitSearch: RequestHandler = async (req: Request, res: Response) => {
    const data = await this.service.submitSearchQuery(req.body, res.locals.user.token)
    res.redirect(`/subjects?search_id=${encodeURIComponent(data.queryExecutionId)}`)
  }
}
