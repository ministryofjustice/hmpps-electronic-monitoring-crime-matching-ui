import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import { generateArrowFeatures } from '../../../featureHelpers'

const createLinesSource = lines => {
  const formatter = new GeoJSON()
  const features = formatter.readFeatures(
    {
      type: 'FeatureCollection',
      features: lines,
    },
    {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    },
  )

  return new VectorSource({
    features,
  })
}

class ArrowsLayer extends VectorLayer {
  constructor(lines) {
    super({
      source: new VectorSource(),
      properties: {
        title: 'arrowsLayer',
      },
    })

    this.on('prerender', () => {
      const map = this.get('map')
      const zoom = map.getView().getZoom()

      this.getSource().clear()
      this.getSource().addFeatures(generateArrowFeatures(zoom, createLinesSource(lines)))
    })
  }
}

export default ArrowsLayer
