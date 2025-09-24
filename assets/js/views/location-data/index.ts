import { MojMap } from 'hmpps-open-layers-map'
import { LocationsLayer, TracksLayer, CirclesLayer, NumberingLayer } from 'hmpps-open-layers-map/layers'
import { isEmpty } from 'ol/extent'
import createLayerVisibilityToggle from './controls/layerVisibilityToggle'
import { queryElement } from '../../utils/utils'
import initialiseDateFilterForm from '../../forms/date-filter-form'

const initialiseLocationDataView = async () => {
  const mojMap = queryElement(document, 'moj-map') as MojMap

  await new Promise<void>(resolve => {
    mojMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const map = mojMap.olMapInstance!
  const geoJson = mojMap.geojson

  if (!geoJson) return

  let locationSource = null
  const locationsLayer = mojMap.addLayer(
    new LocationsLayer({
      title: 'pointsLayer',
      geoJson,
    }),
  )!

  const tracksLayer = mojMap.addLayer(
    new TracksLayer({
      title: 'tracksLayer',
      geoJson,
      visible: false,
      lines: { title: 'linesLayer' },
      arrows: { enabled: true, title: 'arrowsLayer' },
    }),
  )!

  const confidenceLayer = mojMap.addLayer(
    new CirclesLayer({
      geoJson,
      id: 'confidence',
      title: 'confidenceLayer',
      radiusProperty: 'confidence',
      visible: false,
      zIndex: 20,
    }),
  )

  const numbersLayer = mojMap.addLayer(
    new NumberingLayer({
      geoJson,
      numberProperty: 'sequenceNumber',
      title: 'numberingLayer',
      visible: false,
      zIndex: 30,
    }),
  )

  mojMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
      detail: { message: 'All custom layers added' },
    }),
  )

  if (locationsLayer) locationSource = locationsLayer.getSource()

  if (locationSource) {
    const extent = locationSource.getExtent()

    if (isEmpty(extent) === false) {
      map.getView().fit(extent, {
        maxZoom: 16,
        padding: [30, 30, 30, 30],
        size: map.getSize(),
      })
    }
  }

  // Add controls
  if (locationsLayer) createLayerVisibilityToggle('#locations', locationsLayer, mojMap)
  if (tracksLayer) createLayerVisibilityToggle('#tracks', tracksLayer, mojMap)
  if (confidenceLayer) createLayerVisibilityToggle('#confidence', confidenceLayer)
  if (numbersLayer) createLayerVisibilityToggle('#numbering', numbersLayer)

  initialiseDateFilterForm()
}

export default initialiseLocationDataView
