import { RequestHandler } from 'express'
import { subjectsQueryParametersSchema } from '../../schemas/subject/subject'
import SubjectService from '../../services/subject/subjects'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { token } = res.locals.user
    const parsedQuery = subjectsQueryParametersSchema.parse(query)
    const queryResults = await this.service.getQuery(token, parsedQuery.queryId, parsedQuery.page)

    res.render('pages/subject/index', {
      subjects: queryResults.data,
      pageCount: queryResults.pageCount,
      pageNumber: queryResults.pageNumber,
      queryId: parsedQuery.queryId,
    })
  }

  search: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const formData = req.body

    const result = await this.service.createQuery(token, formData)

    req.session.formData = formData

    if (result.ok) {
      res.redirect(`/location-data/subjects?queryId=${encodeURIComponent(result.data.queryExecutionId)}`)
    } else {
      req.session.validationErrors = result.error
      res.redirect('/location-data/subjects')
    }
  }
}
