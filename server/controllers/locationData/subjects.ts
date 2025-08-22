import { RequestHandler } from 'express'
import { subjectsFormDataSchema, subjectsQueryParametersSchema } from '../../schemas/locationData/subjects'
import PersonsService from '../../services/personsService'
import { convertZodErrorToValidationError } from '../../utils/errors'

export default class SubjectsController {
  constructor(private readonly service: PersonsService) {}

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { token } = res.locals.user
    const parsedQuery = subjectsQueryParametersSchema.parse(query)
    const queryResults = await this.service.getPersons(token, parsedQuery.name, parsedQuery.nomisId, parsedQuery.page)

    res.render('pages/locationData/index', {
      origin: req.originalUrl,
      name: parsedQuery.name,
      nomisId: parsedQuery.nomisId,
      persons: queryResults.data,
      pageCount: queryResults.pageCount,
      pageNumber: queryResults.pageNumber,
    })
  }

  search: RequestHandler = async (req, res) => {
    const formData = subjectsFormDataSchema.safeParse(req.body)

    if (formData.success) {
      const params = new URLSearchParams(formData.data)
      res.redirect(`/location-data/subjects?${params.toString()}`)
    } else {
      req.session.validationErrors = convertZodErrorToValidationError(formData.error)
      res.redirect('/location-data/subjects')
    }
  }
}
