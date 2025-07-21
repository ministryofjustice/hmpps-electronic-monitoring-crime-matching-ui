import axios, { AxiosRequestConfig } from 'axios'
import TileLayer from 'ol/layer/Tile'
import TileState from 'ol/TileState'
import { XYZ } from 'ol/source'
import { LoadFunction } from 'ol/Tile'
import config from './config'

const ordnanceSurveyTileLoader =
  (token: string): LoadFunction =>
  (tile, src) => {
    const params: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    }

    axios
      .get(src, params)
      .then(response => {
        if (response.data !== undefined) {
          // @ts-expect-error property getImage does not exist
          // eslint-disable-next-line no-param-reassign
          tile.getImage().src = URL.createObjectURL(response.data)
        } else {
          tile.setState(TileState.ERROR)
        }
      })
      .catch(() => {
        tile.setState(TileState.ERROR)
      })
  }

class OrdnanceSurveyTileLayer extends TileLayer {
  constructor(tileUrl: string, token: string) {
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
