import { RequestHandler } from 'express'
import { mdssPositionsToGeoJson } from 'hmpps-open-layers-map/converters'
import CrimeMappingService from '../services/crimeMapping'
import formatLocationData from '../presenters/helpers/formatLocationFeature'
import config from '../config'

export default class CrimeMappingController {
  constructor(private readonly service: CrimeMappingService) {}

  view: RequestHandler = async (req, res) => {
    const data = await this.service.getData()
    let geoJsonData = mdssPositionsToGeoJson(data)
    geoJsonData = formatLocationData(geoJsonData)

    res.render('pages/crime-mapping/index', {
      geoJson: JSON.stringify(geoJsonData),
      tileUrl: config.maps.tileUrl,
      vectorUrl: config.maps.vectorUrl,
    })
  }
}
