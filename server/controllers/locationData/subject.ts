import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  search: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const formData = req.body

    const result = await this.service.createQuery(token, formData)
    const subjectsQueryId = req.session.queryId

    if (result.ok) {
      res.redirect(`/location-data/subject?queryId=${encodeURIComponent(result.data.queryExecutionId)}`)
    } else {
      req.session.validationErrors = result.error
      if (subjectsQueryId) {
        res.redirect(`/location-data/subjects?queryId=${encodeURIComponent(subjectsQueryId)}`)
      } else {
        res.redirect('/location-data/subjects')
      }
    }
  }
}
