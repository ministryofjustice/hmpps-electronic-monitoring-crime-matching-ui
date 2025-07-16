import { Map } from 'ol'
import OrdnanceSurveyTileLayer from './tiles'
import DefaultView from './view'

class ElectronicMonitoringMap extends Map {
  constructor({ target, osMapsTileUrl, osMapsAccessToken, layers = [], overlays = [], interactions = [] }) {
    super({
      target,
      layers: [new OrdnanceSurveyTileLayer(osMapsTileUrl, osMapsAccessToken), ...layers],
      overlays,
      interactions,
      view: new DefaultView(),
    })
  }
}

export default ElectronicMonitoringMap
