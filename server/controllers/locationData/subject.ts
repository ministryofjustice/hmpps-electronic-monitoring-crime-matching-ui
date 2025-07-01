import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'
import { subjectQueryParametersSchema } from '../../schemas/locationData/subject'
import createGeoJsonData from '../../presenters/crimeMapping'
import config from '../../config'

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

  view: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const {
      query,
      params: { personId },
    } = req
    const { from, to } = subjectQueryParametersSchema.parse(query)
    const queryResults = await this.service.getLocationData(token, personId, from, to)
    const geoJsonData = createGeoJsonData(queryResults.locations)

    res.render('pages/locationData/subject', {
      points: JSON.stringify(geoJsonData.points),
      lines: JSON.stringify(geoJsonData.lines),
      tileUrl: config.maps.tileUrl,
    })
  }
}
