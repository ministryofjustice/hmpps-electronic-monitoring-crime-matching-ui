import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import { Fill, Stroke, Style } from 'ol/style'
import { Circle as CircleGeom } from 'ol/geom'
import { Feature } from 'ol'

const confidenceCircleStyle = new Style({
  stroke: new Stroke({
    color: 'orange',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(255, 165, 0, 0.1)',
  }),
})

const createConfidenceSource = points => {
  const formatter = new GeoJSON()
  const features = formatter.readFeatures(
    {
      type: 'FeatureCollection',
      features: points,
    },
    {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    },
  )

  return new VectorSource({
    features: features.map(feature => {
      const coords = feature.getGeometry().getCoordinates()
      const radius = feature.get('confidence')
      const circle = new CircleGeom(coords, radius)

      return new Feature({
        geometry: circle,
      })
    }),
  })
}

class ConfidenceLayer extends VectorLayer {
  constructor(points) {
    super({
      visible: false,
      source: createConfidenceSource(points),
      style: confidenceCircleStyle,
      properties: {
        title: 'confidenceLayer',
      },
    })
  }
}

export default ConfidenceLayer
