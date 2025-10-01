import { RequestHandler } from 'express'
import { Dayjs } from 'dayjs'
import {
  downloadLocationsQueryParameterSchema,
  searchLocationsFormDataSchema,
  viewLocationsQueryParametersSchema,
} from '../../schemas/locationData/subject'
import config from '../../config'
import { createMojAlertWarning } from '../../utils/alerts'
import { MojAlert } from '../../types/govUk/mojAlert'
import DeviceActivationsService from '../../services/deviceActivationsService'
import { getDateComponents, parseDateTimeFromISOString } from '../../utils/date'
import { convertZodErrorToValidationError, flattenErrorsToMap } from '../../utils/errors'
import ValidationService from '../../services/locationData/validationService'
import generateLocationDataReport from '../../presenters/reports/locationData'
import PersonsService from '../../services/personsService'
import DeviceActivation from '../../types/entities/deviceActivation'
import Position from '../../types/entities/position'
import Person from '../../types/entities/person'
import annotatePositionsWithDisplayProperties from '../../presenters/helpers/positions'

export default class SubjectController {
  constructor(
    private readonly deviceActivationsService: DeviceActivationsService,
    private readonly personsService: PersonsService,
    private readonly validationService: ValidationService,
  ) {}

  private async fetchWearerAndPositions(
    username: string,
    deviceActivation: DeviceActivation,
    fromDate: Dayjs,
    toDate: Dayjs,
  ): Promise<[Person, Position[]]> {
    const deviceWearerPromise = this.personsService.getPerson(username, Number(deviceActivation!.personId))
    const positionsPromise = this.deviceActivationsService.getDeviceActivationPositions(
      username,
      deviceActivation!,
      fromDate,
      toDate,
    )
    return Promise.all([deviceWearerPromise, positionsPromise])
  }

  search: RequestHandler = async (req, res) => {
    const deviceActivation = req.deviceActivation!
    const formData = searchLocationsFormDataSchema.safeParse(req.body)

    if (formData.success) {
      const fromDate = parseDateTimeFromISOString(formData.data.fromDate)
      const toDate = parseDateTimeFromISOString(formData.data.toDate)
      const validationResult = this.validationService.validateDeviceActivationPositionsRequest(
        deviceActivation!,
        fromDate,
        toDate,
      )

      if (validationResult.success) {
        const params = `from=${formData.data.fromDate}&to=${formData.data.toDate}`
        res.redirect(`/location-data/device-activations/${deviceActivation.deviceActivationId}?${params.toString()}`)
      } else {
        req.session.formData = {
          ...req.body,
          deviceActivationId: req.params.deviceActivationId,
        }
        req.session.validationErrors = validationResult.errors
        res.redirect(req.body.origin)
      }
    } else {
      req.session.formData = {
        ...req.body,
        deviceActivationId: req.params.deviceActivationId,
      }
      req.session.validationErrors = convertZodErrorToValidationError(formData.error)
      res.redirect(req.body.origin)
    }
  }

  view: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { query, deviceActivation } = req
    const { from, to } = viewLocationsQueryParametersSchema.parse(query)
    const fromDate = parseDateTimeFromISOString(from)
    const toDate = parseDateTimeFromISOString(to)
    const validationResult = this.validationService.validateDeviceActivationPositionsRequest(
      deviceActivation!,
      fromDate,
      toDate,
    )

    if (validationResult.success) {
      const [deviceWearer, positions] = await this.fetchWearerAndPositions(
        username,
        deviceActivation!,
        fromDate,
        toDate,
      )
      const alerts: Array<MojAlert> = []

      const featuresWithDeviceInfo = geoJsonData.features.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          subjectName: deviceWearer.name,
          subjectNomisId: deviceWearer.nomisId,
        },
      }))

      geoJsonData.features = featuresWithDeviceInfo

      if (positions.length === 0) {
        alerts.push(createMojAlertWarning('No GPS Data for Dates and Times Selected'))
      }

      res.render('pages/locationData/subject', {
        deviceWearer,
        exportForm: {
          enabled: true,
          from,
          to,
          url: `/location-data/device-activations/${deviceActivation?.deviceActivationId}/download`,
        },
        origin: req.originalUrl,
        apiKey: config.maps.apiKey,
        positions: annotatePositionsWithDisplayProperties(positions),
        tileUrl: config.maps.tileUrl,
        vectorUrl: config.maps.vectorUrl,
        alerts,
        formData: {
          fromDate: getDateComponents(fromDate),
          toDate: getDateComponents(toDate),
          ...res.locals.formData,
        },
      })
    } else {
      res.render('pages/locationData/subject', {
        exportForm: {
          enabled: false,
        },
        origin: req.originalUrl,
        apiKey: config.maps.apiKey,
        positions: [],
        tileUrl: config.maps.tileUrl,
        alerts: [],
        formData: {
          fromDate: getDateComponents(fromDate),
          toDate: getDateComponents(toDate),
          ...res.locals.formData,
        },
        errors: {
          ...flattenErrorsToMap(validationResult.errors),
          ...res.locals.errors,
        },
      })
    }
  }

  download: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { query, deviceActivation } = req
    const { from, to, reportType } = downloadLocationsQueryParameterSchema.parse(query)
    const fromDate = parseDateTimeFromISOString(from)
    const toDate = parseDateTimeFromISOString(to)
    const validationResult = this.validationService.validateDeviceActivationPositionsRequest(
      deviceActivation!,
      fromDate,
      toDate,
    )

    if (validationResult.success) {
      const [deviceWearer, positions] = await this.fetchWearerAndPositions(
        username,
        deviceActivation!,
        fromDate,
        toDate,
      )

      const csvData = generateLocationDataReport(deviceWearer, deviceActivation!, positions, reportType === 'condensed')
      const fileName = `location-data-${deviceActivation?.deviceId}-${from}-${to}-${reportType}.csv`

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

      res.send(csvData)
    } else {
      next(new Error('Failed to validate query parameters'))
    }
  }
}
