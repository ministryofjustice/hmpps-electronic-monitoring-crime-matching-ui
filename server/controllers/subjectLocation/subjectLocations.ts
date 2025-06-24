import { RequestHandler } from 'express'
import SubjectLocationService from '../../services/subjectLocation/subjectLocations'

export default class SubjectLocationController {
  constructor(private readonly service: SubjectLocationService) {}

  search: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const formData = req.body

    const result = await this.service.createQuery(token, formData)

    if (result.ok) {
      res.redirect(
        `/location-data/subjects/location-search?queryId=${encodeURIComponent(result.data.queryExecutionId)}`,
      )
    } else {
      req.session.validationErrors = result.error
      res.redirect('/location-data/subjects')
    }
  }
}
