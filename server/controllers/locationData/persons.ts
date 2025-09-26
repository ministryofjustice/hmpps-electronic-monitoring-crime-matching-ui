import { RequestHandler } from 'express'
import { personsFormDataSchema, personsQueryParametersSchema } from '../../schemas/locationData/persons'
import PersonsService from '../../services/personsService'
import { convertZodErrorToValidationError } from '../../utils/errors'

export default class PersonsController {
  constructor(private readonly service: PersonsService) {}

  view: RequestHandler = async (req, res) => {
    const { query } = req
    const { username } = res.locals.user
    const parsedQuery = personsQueryParametersSchema.parse(query)

    const { searchField, searchTerm } = parsedQuery

    if (searchField && searchTerm) {
      const queryResults = await this.service.getPersons(username, searchField, searchTerm, parsedQuery.page)
      res.render('pages/locationData/index', {
        origin: req.originalUrl,
        persons: queryResults.data,
        pageCount: queryResults.pageCount,
        pageNumber: queryResults.pageNumber,
        searchField,
        searchTerm,
        formData: {
          ...res.locals.formData,
        },
      })
    } else {
      res.render('pages/locationData/index', {
        persons: [],
        pageCount: 1,
        pageNumber: 1,
        formData: {
          ...res.locals.formData,
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
      const params = `searchField=${formData.data.searchField}&searchTerm=${formData.data.searchTerm}`
      res.redirect(`/location-data/persons?${params.toString()}`)
    } else {
      req.session.validationErrors = convertZodErrorToValidationError(formData.error)
      res.redirect('/location-data/persons')
    }
  }
}
