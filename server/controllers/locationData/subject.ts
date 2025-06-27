import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'
import { subjectLocationsQueryParametersSchema } from '../../schemas/locationData/subject'
import createGeoJsonData from '../../presenters/crimeMapping'
import config from '../../config'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  search: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const formData = req.body

    const result = await this.service.createQuery(token, formData)

    if (result.ok) {
      res.redirect(`/location-data/subject?queryId=${encodeURIComponent(result.data.queryExecutionId)}`)
    } else {
      req.session.validationErrors = result.error
      res.redirect('/location-data/subjects')
    }
  }

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { token } = res.locals.user
    const parsedQuery = subjectLocationsQueryParametersSchema.parse(query)
    const queryResults = await this.service.getQuery(token, parsedQuery.queryId)
    const geoJsonData = createGeoJsonData(queryResults.locations)

    res.render('pages/locationData/subject', {
      points: JSON.stringify(geoJsonData.points),
      lines: JSON.stringify(geoJsonData.lines),
      tileUrl: config.maps.tileUrl,
    })
  }
}
