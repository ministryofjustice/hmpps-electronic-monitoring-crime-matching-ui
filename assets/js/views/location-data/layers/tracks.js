import LayerGroup from 'ol/layer/Group'
import ArrowsLayer from './arrows'
import LinesLayer from './lines'

class TracksLayer extends LayerGroup {
  constructor(lines) {
    super({
      visible: false,
      layers: [new LinesLayer(lines), new ArrowsLayer(lines)],
    })
  }
}

export default TracksLayer
