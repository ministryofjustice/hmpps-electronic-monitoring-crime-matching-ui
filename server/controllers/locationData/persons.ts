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

    const { personSearchType } = parsedQuery
    const searchValue = personSearchType ? String(parsedQuery[personSearchType]) : null

    if (personSearchType && searchValue) {
      const queryResults = await this.service.getPersons(token, personSearchType, searchValue, parsedQuery.page)
      res.render('pages/locationData/index', {
        origin: req.originalUrl,
        name: parsedQuery.name,
        nomisId: parsedQuery.nomisId,
        persons: queryResults.data,
        pageCount: queryResults.pageCount,
        pageNumber: queryResults.pageNumber,
        formData: {
          ...res.locals.formData,
          personSearchType,
        },
      })
    } else {
      res.render('pages/locationData/index', {
        persons: [],
        pageCount: 1,
        pageNumber: 1,
        formData: {
          ...res.locals.formData,
          personSearchType,
        },
      })
    }
  }

  search: RequestHandler = async (req, res) => {
    const formData = personsFormDataSchema.safeParse(req.body)
    req.session.formData = {
      ...req.body,
    }

    if (formData.success) {
      const params = new URLSearchParams(formData.data)
      res.redirect(`/location-data/persons?${params.toString()}`)
    } else {
      req.session.validationErrors = convertZodErrorToValidationError(formData.error)
      res.redirect('/location-data/persons')
    }
  }
}
