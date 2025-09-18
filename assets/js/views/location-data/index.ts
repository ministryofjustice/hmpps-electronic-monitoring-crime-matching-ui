import { MojMap } from 'hmpps-open-layers-map'
import { LocationLayer } from 'hmpps-open-layers-map/layers'
import { isEmpty } from 'ol/extent'
import LocationsLayer from './layers/locations'
import TracksLayer from './layers/tracks'
import ConfidenceLayer from './layers/confidence'
import NumberingLayer from './layers/numbering'
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

  /* const locationsLayer = new LocationsLayer(points)
  const locationSource = locationsLayer.getSource()
  const tracksLayer = new TracksLayer(lines)
  const confidenceLayer = new ConfidenceLayer(points)
  const locationNumberingLayer = new NumberingLayer(points) */

  let locationSource = null
  const locationsLayer = mojMap.addLayer(new LocationLayer(geoJson))
  if (locationsLayer) locationSource = locationsLayer.getSource()
  /* mojMap.map.addLayer(tracksLayer)
  mojMap.map.addLayer(confidenceLayer)
  mojMap.map.addLayer(locationNumberingLayer) */

  mojMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
      detail: { message: 'All custom layers added' },
    }),
  )

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
  /* createLayerVisibilityToggle('#tracks', tracksLayer)
  createLayerVisibilityToggle('#confidence', confidenceLayer)
  createLayerVisibilityToggle('#numbering', locationNumberingLayer) */

  initialiseDateFilterForm()
}

export default initialiseLocationDataView
