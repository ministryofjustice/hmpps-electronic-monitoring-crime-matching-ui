import { Map } from 'ol'
import { defaults as defaultInteractions } from 'ol/interaction/defaults.js'
import OrdnanceSurveyTileLayer from './tiles'
import DefaultView from './view'

class ElectronicMonitoringMap extends Map {
  constructor({ target, osMapsTileUrl, osMapsAccessToken, layers = [], overlays = [], interactions = [] }) {
    super({
      target,
      layers: [new OrdnanceSurveyTileLayer(osMapsTileUrl, osMapsAccessToken), ...layers],
      overlays,
      interactions: defaultInteractions().extend(interactions),
      view: new DefaultView(),
    })
  }
}

export default ElectronicMonitoringMap
