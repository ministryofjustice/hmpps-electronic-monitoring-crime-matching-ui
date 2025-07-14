import axios from 'axios'
import TileLayer from 'ol/layer/Tile'
import TileState from 'ol/TileState'
import { XYZ } from 'ol/source'
import config from './config'

const ordnanceSurveyTileLoader = token => (tile, src) => {
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
  }

  axios
    .get(src, params)
    .then(response => {
      if (response.data !== undefined) {
        // eslint-disable-next-line no-param-reassign
        tile.getImage().src = URL.createObjectURL(response.data)
      } else {
        tile.setState(TileState.ERROR)
      }
    })

    .catch(e => {
      console.log(e)
      tile.setState(TileState.ERROR)
    })
}

class OrdnanceSurveyTileLayer extends TileLayer {
  constructor(tileUrl, token) {
    super({
      source: new XYZ({
        minZoom: config.tiles.zoom.min,
        maxZoom: config.tiles.zoom.max,
        url: tileUrl,
        tileLoadFunction: ordnanceSurveyTileLoader(token),
      }),
    })
  }
}

export default OrdnanceSurveyTileLayer
