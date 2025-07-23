import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import { LineString } from 'ol/geom'
import { Feature } from 'ol'
import { generateArrowFeatures } from '../../../featureHelpers'

const createLinesSource = (lines: string) => {
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
  ) as Array<Feature<LineString>>

  return new VectorSource<Feature<LineString>>({
    features,
  })
}

class ArrowsLayer extends VectorLayer {
  constructor(lines: string) {
    super({
      source: new VectorSource(),
      properties: {
        title: 'arrowsLayer',
      },
    })

    this.on('prerender', () => {
      const map = this.get('map')
      const zoom = map.getView().getZoom()
      const source = this.getSource()

      if (source) {
        source.clear()
        source.addFeatures(generateArrowFeatures(zoom, createLinesSource(lines)))
      }
    })
  }
}

export default ArrowsLayer
