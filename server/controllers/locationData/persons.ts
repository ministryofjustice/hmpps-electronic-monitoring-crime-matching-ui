import { RequestHandler } from 'express'
import { personsFormDataSchema, personsQueryParametersSchema } from '../../schemas/locationData/persons'
import PersonsService from '../../services/personsService'
import { convertZodErrorToValidationError } from '../../utils/errors'

export default class PersonsController {
  constructor(private readonly service: PersonsService) {}

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { token } = res.locals.user
    const parsedQuery = personsQueryParametersSchema.parse(query)
    const queryResults = await this.service.getPersons(
      token,
      parsedQuery.personName,
      parsedQuery.nomisId,
      parsedQuery.deviceId,
      parsedQuery.page,
    )

    res.render('pages/locationData/index', {
      origin: req.originalUrl,
      personName: parsedQuery.personName,
      nomisId: parsedQuery.nomisId,
      deviceId: parsedQuery.deviceId,
      persons: queryResults.data,
      pageCount: queryResults.pageCount,
      pageNumber: queryResults.pageNumber,
    })
  }

  search: RequestHandler = async (req, res) => {
    const formData = personsFormDataSchema.safeParse(req.body)
    req.session.formData = req.body

    if (formData.success) {
      const { personSearchType, personName, nomisId, deviceId } = formData.data
      const params = new URLSearchParams()

      if (personSearchType === 'personName') {
        params.set(personSearchType, personName)
      } else if (personSearchType === 'nomisId') {
        params.set(personSearchType, nomisId)
      } else {
        params.set(personSearchType, deviceId)
      }

      res.redirect(`/location-data/persons?${params.toString()}`)
    } else {
      req.session.validationErrors = convertZodErrorToValidationError(formData.error)
      res.redirect('/location-data/persons')
    }
  }
}
