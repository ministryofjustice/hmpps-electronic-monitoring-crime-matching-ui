import { Map, Overlay } from 'ol'
import { defaults as defaultInteractions } from 'ol/interaction/defaults.js'
import Layer from 'ol/layer/Layer'
import Interaction from 'ol/interaction/Interaction'
import LayerGroup from 'ol/layer/Group'
import OrdnanceSurveyTileLayer from './tiles'
import DefaultView from './view'

type ElectronicMonitoringMapOptions = {
  target: string
  osMapsTileUrl: string
  osMapsAccessToken: string
  layers: Array<Layer | LayerGroup>
  overlays: Array<Overlay>
  interactions: Array<Interaction>
}

class ElectronicMonitoringMap extends Map {
  constructor({
    target,
    osMapsTileUrl,
    osMapsAccessToken,
    layers = [],
    overlays = [],
    interactions = [],
  }: ElectronicMonitoringMapOptions) {
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
