import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'
import { subjectQueryParametersSchema } from '../../schemas/locationData/subject'
import createGeoJsonData from '../../presenters/crimeMapping'
import config from '../../config'
import { createMojAlertWarning } from '../../utils/alerts'
import { MojAlert } from '../../types/govUk/mojAlert'

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
    const alerts: Array<MojAlert> = []
    const geoJsonData = createGeoJsonData(queryResults.locations)

    if (queryResults.locations.length === 0) {
      alerts.push(createMojAlertWarning('No GPS Data for Dates and Times Selected'))
    }

    res.render('pages/locationData/subject', {
      points: geoJsonData.points,
      lines: geoJsonData.lines,
      tileUrl: config.maps.tileUrl,
      alerts,
    })
  }
}
