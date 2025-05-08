import { RequestHandler } from 'express'
import MapService from '../services/mapService'

export default class MapController {
  constructor(private readonly service: MapService) {}

  token: RequestHandler = async (req, res) => {
    const token = await this.service.getToken()

    res.json(token)
  }
}
