import { Request, RequestHandler, Response } from 'express'
import SubjectService from '../services/subjectService'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  view: RequestHandler = async (req: Request, res: Response) => {
    // TODO probably not the best idea to just send req.body here, check what is done elsewhere and why to avoid issues being sent, also the token passing not ideal?
    // Error handling could be here instead of service?
    const data = await this.service.getSearchResults(req.body, res.locals.user.token)
    res.render('pages/subject/index', { data })
  }
}
