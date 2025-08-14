import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'
import { subjectQueryParametersSchema } from '../../schemas/locationData/subject'
import createGeoJsonData from '../../presenters/crimeMapping'
import config from '../../config'
import { createMojAlertWarning } from '../../utils/alerts'
import { MojAlert } from '../../types/govUk/mojAlert'
import DeviceActivationsService from '../../services/deviceActivationsService'
import { getDateComponents, parseISODate } from '../../utils/date'
import { createGovUkErrorMessage } from '../../utils/errors'

export default class SubjectController {
  constructor(
    private readonly service: SubjectService,
    private readonly deviceActivationsService: DeviceActivationsService,
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
    const fromDate = parseISODate(from)
    const toDate = parseISODate(to)
    let hasError = false

    if (!fromDate.isValid()) {
      res.locals.errors.fromDate = createGovUkErrorMessage({
        field: 'fromDate',
        message: 'You must enter a valid value for date',
      })
      hasError = true
    }

    if (!toDate.isValid()) {
      res.locals.errors.toDate = createGovUkErrorMessage({
        field: 'toDate',
        message: 'You must enter a valid value for date',
      })
      hasError = true
    }

    if (!hasError && toDate.valueOf() - fromDate.valueOf() > 48 * 60 * 60 * 1000) {
      res.locals.errors.fromDate = createGovUkErrorMessage({
        field: 'fromDate',
        message: 'Date and time search window should not exceed 48 hours',
      })
      hasError = true
    }

    if (!hasError) {
      const inBounds = await this.deviceActivationsService.isDateRangeWithinDeviceActivation(
        deviceActivation!,
        fromDate,
        toDate,
      )

      if (!inBounds) {
        res.locals.errors.fromDate = createGovUkErrorMessage({
          field: 'fromDate',
          message: 'Date and time search window should be within device activation date range',
        })
        hasError = true
      }
    }

    if (hasError) {
      return res.render('pages/locationData/subject', {
        points: JSON.stringify([]),
        lines: JSON.stringify([]),
        tileUrl: config.maps.tileUrl,
        alerts: [],
        fromDate: getDateComponents(from),
        toDate: getDateComponents(to),
      })
    }

    const queryResults = await this.deviceActivationsService.getDeviceActivationPositions(
      token,
      deviceActivation!,
      fromDate,
      toDate,
    )
    const alerts: Array<MojAlert> = []
    const geoJsonData = createGeoJsonData(queryResults)

    if (queryResults.length === 0) {
      alerts.push(createMojAlertWarning('No GPS Data for Dates and Times Selected'))
    }

    return res.render('pages/locationData/subject', {
      points: JSON.stringify(geoJsonData.points),
      lines: JSON.stringify(geoJsonData.lines),
      tileUrl: config.maps.tileUrl,
      alerts,
      fromDate: getDateComponents(from),
      toDate: getDateComponents(to),
    })
  }
}
