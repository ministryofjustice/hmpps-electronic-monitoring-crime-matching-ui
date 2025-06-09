import { getLength } from 'ol/sphere'
import { Feature } from 'ol'
import { Fill, Style, RegularShape } from 'ol/style'
import { Point, Circle as CircleGeom } from 'ol/geom'

function generateArrowFeatures(mapZoom, lineSource) {
  const arrowFeatures = []
  const zoomFactor = 1.2
  const defaultZoom = 13
  const maxArrows = 10
  const minArrows = 1
  const baseSpacing = 200

  // Calculates arrow size when zooming
  const arrowSize = (100 / mapZoom) * zoomFactor

  lineSource.getFeatures().forEach(lineFeature => {
    const geometry = lineFeature.getGeometry()
    if (!geometry || geometry.getType() !== 'LineString') return
    const lineLength = getLength(geometry)

    const adjustedSpacing = baseSpacing * Math.pow(zoomFactor, defaultZoom - mapZoom)

    let arrowCount = lineLength / adjustedSpacing
    arrowCount = Math.max(minArrows, Math.min(Math.floor(arrowCount), maxArrows))

    for (let i = 1; i <= arrowCount; i += 1) {
      const arrowPoint = i / (arrowCount + 1)
      const coord = geometry.getCoordinateAt(arrowPoint)

      const arrowFeature = new Feature({
        geometry: new Point(coord),
      })

      arrowFeature.setStyle(
        new Style({
          image: new RegularShape({
            points: 3,
            radius: arrowSize,
            fill: new Fill({ color: 'black' }),
            rotation: lineFeature.get('direction'),
            rotateWithView: true,
          }),
        }),
      )
      arrowFeatures.push(arrowFeature)
    }
  })
  return arrowFeatures
}

function generateConfidenceCircleFeatures(pointSource) {
  const confidenceFeatures = []

  pointSource.getFeatures().forEach(pointFeature => {
    const coords = pointFeature.getGeometry().getCoordinates()
    const radius = pointFeature.get('confidence')
    const circle = new CircleGeom(coords, radius)

    const circleFeature = new Feature({
      geometry: circle,
    })

    confidenceFeatures.push(circleFeature)
  })
  return confidenceFeatures
}

export { generateArrowFeatures, generateConfidenceCircleFeatures }
