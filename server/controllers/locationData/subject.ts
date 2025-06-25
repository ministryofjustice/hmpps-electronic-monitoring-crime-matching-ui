import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  search: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const formData = req.body

    const result = await this.service.createQuery(token, formData)

    if (result.ok) {
      res.redirect(`/location-data/subject/location-search?queryId=${encodeURIComponent(result.data.queryExecutionId)}`)
    } else {
      req.session.validationErrors = result.error
      res.redirect('/location-data/subjects')
    }
  }
}
