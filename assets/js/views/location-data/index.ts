import 'hmpps-open-layers-map'
import type { MojMap } from 'hmpps-open-layers-map'
import { isEmpty } from 'ol/extent'
import LocationsLayer from './layers/locations'
import TracksLayer from './layers/tracks'
import ConfidenceLayer from './layers/confidence'
import NumberingLayer from './layers/numbering'
import LocationPointerInteraction from './interactions/locationPointer'
import LocationMetadataOverlay from './overlays/locationMetadata'
import createLayerVisibilityToggle from './controls/layerVisibilityToggle'
import { queryElement } from '../../utils/utils'

const initialiseLocationDataView = async () => {
  const mojMap = queryElement(document, 'moj-map' as keyof HTMLElementTagNameMap) as MojMap

  await new Promise<void>(resolve => {
    mojMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const points = mojMap.getAttribute('data-points') || '[]'
  const lines = mojMap.getAttribute('data-lines') || '[]'

  const locationsLayer = new LocationsLayer(points)
  const locationSource = locationsLayer.getSource()
  const tracksLayer = new TracksLayer(lines)
  const confidenceLayer = new ConfidenceLayer(points)
  // const locationMetadataOverlay = new LocationMetadataOverlay(overlay, overlayTemplate)
  const locationNumberingLayer = new NumberingLayer(points)

  mojMap.map.addLayer(locationsLayer)
  mojMap.map.addLayer(tracksLayer)
  mojMap.map.addLayer(confidenceLayer)
  mojMap.map.addLayer(locationNumberingLayer)

  // Fit view to extent
  const source = locationsLayer.getSource()

  if (source) {
    const extent = source.getExtent()

    if (isEmpty(extent) === false) {
      mojMap.map.getView().fit(extent, {
        maxZoom: 16,
        padding: [30, 30, 30, 30],
        size: mojMap.map.getSize(),
      })
    }
  }

  // Add controls
  createLayerVisibilityToggle('#locations', locationsLayer)
  createLayerVisibilityToggle('#tracks', tracksLayer)
  createLayerVisibilityToggle('#confidence', confidenceLayer)
  createLayerVisibilityToggle('#numbering', locationNumberingLayer)
}

export default initialiseLocationDataView
