import { RequestHandler } from 'express'
import SubjectService from '../../services/locationData/subject'
import { subjectLocationsFormDataSchema, subjectQueryParametersSchema } from '../../schemas/locationData/subject'
import createGeoJsonData from '../../presenters/crimeMapping'
import config from '../../config'
import { createMojAlertWarning } from '../../utils/alerts'
import { MojAlert } from '../../types/govUk/mojAlert'
import { convertZodErrorToValidationError, createGovUkErrorMessage } from '../../utils/errors'
import { GovUkErrorMessage } from '../../types/govUk/errorMessage'
import { getDateComponents } from '../../utils/date'

export default class SubjectController {
  constructor(private readonly service: SubjectService) {}

  search: RequestHandler = async (req, res) => {
    const { token } = res.locals.user
    const formData = subjectLocationsFormDataSchema.safeParse(req.body)

    if (formData.success) {
      res.redirect(`/location-data/${formData.data.personId}?from=${formData.data.fromDate}&to=${formData.data.toDate}`)
    } else {
      req.session.validationErrors = convertZodErrorToValidationError(formData.error)
      req.session.formData = req.body
      res.redirect(req.body.origin)
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
    const locations = queryResults.ok ? queryResults.data.locations : []
    const geoJsonData = createGeoJsonData(locations)
    const alerts: Array<MojAlert> =
      locations.length === 0 ? [createMojAlertWarning('No GPS Data for Dates and Times Selected')] : []

    // If no formData in session, populate form with query params
    if (Object.keys(res.locals.formData).length === 0) {
      res.locals.formData = {
        fromDate: getDateComponents(from),
        toDate: getDateComponents(to),
      }

      // If query params invalid, add errors to form
      if (!queryResults.ok) {
        res.locals.errors = queryResults.error.reduce(
          (acc, error) => {
            acc[error.field] = createGovUkErrorMessage(error)
            return acc
          },
          {} as Record<string, GovUkErrorMessage>,
        )
      }
    }

    res.render('pages/locationData/subject', {
      personId,
      points: JSON.stringify(geoJsonData.points),
      lines: JSON.stringify(geoJsonData.lines),
      tileUrl: config.maps.tileUrl,
      alerts,
      origin: req.originalUrl,
    })
  }
}
