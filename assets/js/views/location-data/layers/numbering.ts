import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import { Fill, Stroke, Text, Style } from 'ol/style'

const createNumberingStyle = (value: string) => {
  return new Style({
    text: new Text({
      textAlign: 'left',
      textBaseline: 'middle',
      font: 'bold 12px "Inter", system-ui, sans-serif',
      fill: new Fill({ color: 'black' }),
      stroke: new Stroke({ color: 'white', width: 2 }),
      text: value,
      offsetX: 12,
      offsetY: 1,
    }),
  })
}

const createNumberingSource = (points: string) => {
  const formatter = new GeoJSON()
  const features = formatter.readFeatures(
    {
      type: 'FeatureCollection',
      features: JSON.parse(points),
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

class NumberingLayer extends VectorLayer {
  constructor(points: string) {
    super({
      visible: false,
      source: createNumberingSource(points),
      style: feature => createNumberingStyle(feature.get('sequenceNumber')),
      properties: {
        title: 'numberingLayer',
      },
    })
  }
}

export default NumberingLayer
