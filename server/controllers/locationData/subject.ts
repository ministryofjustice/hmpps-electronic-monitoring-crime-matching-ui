import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'
import { subjectQueryParametersSchema } from '../../schemas/locationData/subject'
import createGeoJsonData from '../../presenters/crimeMapping'
import config from '../../config'
import { createMojAlertWarning } from '../../utils/alerts'
import { MojAlert } from '../../types/govUk/mojAlert'
import DeviceActivationsService from '../../services/deviceActivationsService'
import { getDateComponents, parseDateTimeFromISOString } from '../../utils/date'
import { flattenErrorsToMap } from '../../utils/errors'
import ValidationService from '../../services/locationData/validationService'

export default class SubjectController {
  constructor(
    private readonly service: SubjectService,
    private readonly deviceActivationsService: DeviceActivationsService,
    private readonly validationService: ValidationService,
  ) {}

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
    const { query, deviceActivation } = req
    const { from, to } = subjectQueryParametersSchema.parse(query)
    const fromDate = parseDateTimeFromISOString(from)
    const toDate = parseDateTimeFromISOString(to)
    const validationResult = this.validationService.validateDeviceActivationPositionsRequest(
      deviceActivation!,
      fromDate,
      toDate,
    )

    if (validationResult.success) {
      const positions = await this.deviceActivationsService.getDeviceActivationPositions(
        token,
        deviceActivation!,
        fromDate,
        toDate,
      )
      const geoJsonData = createGeoJsonData(positions)
      const alerts: Array<MojAlert> = []

      if (positions.length === 0) {
        alerts.push(createMojAlertWarning('No GPS Data for Dates and Times Selected'))
      }

      res.render('pages/locationData/subject', {
        points: geoJsonData.points,
        lines: geoJsonData.lines,
        tileUrl: config.maps.tileUrl,
        vectorUrl: config.maps.vectorUrl,
        alerts,
        fromDate: getDateComponents(fromDate),
        toDate: getDateComponents(toDate),
      })
    } else {
      res.render('pages/locationData/subject', {
        points: JSON.stringify([]),
        lines: JSON.stringify([]),
        tileUrl: config.maps.tileUrl,
        alerts: [],
        fromDate: getDateComponents(fromDate),
        toDate: getDateComponents(toDate),
        errors: {
          ...res.locals.errors,
          ...flattenErrorsToMap(validationResult.errors),
        },
      })
    }
  }
}
