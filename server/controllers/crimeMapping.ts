import { RequestHandler } from 'express'
import CrimeMappingService from '../services/crimeMapping'

export default class CrimeMappingController {
  constructor(private readonly service: CrimeMappingService) {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/crime-mapping/index')
  }
}
