import { RequestHandler } from 'express'
import CrimeMappingService from '../services/crimeMapping'
import createGeoJsonData from '../presenters/crimeMapping'
import config from '../config'

export default class CrimeMappingController {
  constructor(private readonly service: CrimeMappingService) {}

  view: RequestHandler = async (req, res) => {
    const data = await this.service.getData()
    const geoJsonData = createGeoJsonData(data)

    res.render('pages/crime-mapping/index', {
      geoJson: JSON.stringify(geoJsonData),
      tileUrl: config.maps.tileUrl,
      vectorUrl: config.maps.vectorUrl,
    })
  }
}
