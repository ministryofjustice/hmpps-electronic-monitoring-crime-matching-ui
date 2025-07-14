import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'

const locationStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: '#505a5f', width: 2 }),
  }),
})

const createPointsSource = points => {
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
    features,
  })
}

class LocationsLayer extends VectorLayer {
  constructor(points) {
    super({
      source: createPointsSource(points),
      style: locationStyle,
      properties: {
        title: 'pointsLayer',
      },
    })
  }
}

export default LocationsLayer
