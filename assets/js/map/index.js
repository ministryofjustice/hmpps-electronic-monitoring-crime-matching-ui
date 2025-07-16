import { Map } from 'ol'
import OrdnanceSurveyTileLayer from './tiles'
import DefaultView from './view'

// The map class is not responsible for creating the access token
class ElectronicMonitoringMap {
  constructor(target, tileUrl, token) {
    this.target = target
    this.layers = [new OrdnanceSurveyTileLayer(tileUrl, token)]
    this.view = new DefaultView()
  }

  addLayer(layer) {
    this.layers.push(layer)
  }

  render() {
    this.olMap = new Map({
      target: this.target,
      layers: this.layers,
      view: this.view,
    })
  }
}

export default ElectronicMonitoringMap
