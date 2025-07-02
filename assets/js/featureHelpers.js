import { getLength } from 'ol/sphere'
import { Feature } from 'ol'
import { Fill, Style, RegularShape } from 'ol/style'
import { Point, Circle as CircleGeom } from 'ol/geom'

function generateArrowFeatures(mapZoom, lineSource) {
  const arrowFeatures = []
  const zoomFactor = 1.3
  const baseZoom = 13
  const maxArrows = 10
  const minArrows = 1
  const baseSpacing = 200
  const baseArrowSize = 100

  // Calculates arrow size based on zoom
  const arrowSize = (baseArrowSize / mapZoom) * zoomFactor

  lineSource.getFeatures().forEach(lineFeature => {
    const geometry = lineFeature.getGeometry()
    const lineLength = getLength(geometry)

    // Calculate arrow spacing based on zoom
    const adjustedSpacing = baseSpacing * zoomFactor ** (baseZoom - mapZoom)

    // Arrow count in relation to line length with min and max check
    let arrowCount = lineLength / adjustedSpacing
    arrowCount = Math.max(minArrows, Math.min(Math.floor(arrowCount), maxArrows))

    for (let i = 1; i <= arrowCount; i += 1) {
      // Fraction on line string for arrow placement
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
