import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import { Stroke, Style } from 'ol/style'
import { Feature } from 'ol'
import { LineString } from 'ol/geom'

const lineStyle = new Style({
  stroke: new Stroke({
    width: 2,
    color: 'black',
  }),
})

const createLinesSource = (lines: string) => {
  const formatter = new GeoJSON()
  const features = formatter.readFeatures(
    {
      type: 'FeatureCollection',
      features: JSON.parse(lines),
    },
    {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    },
  ) as Array<Feature<LineString>>

  return new VectorSource({
    features,
  })
}

class LinesLayer extends VectorLayer {
  constructor(lines: string) {
    super({
      source: createLinesSource(lines),
      style: lineStyle,
      properties: {
        title: 'linesLayer',
      },
    })
  }
}

export default LinesLayer
