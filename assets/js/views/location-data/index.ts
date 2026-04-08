import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import {
  LocationsLayer,
  TracksLayer,
  CirclesLayer,
  TextLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import { queryElement } from '../../utils/utils'
import initialiseDateFilterForm from '../../forms/date-filter-form'

const initialiseLocationDataView = async () => {
  const emMap = queryElement(document, 'em-map') as EmMap

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const { positions } = emMap

  const locationsLayer = new LocationsLayer({
    title: 'pointsLayer',
    positions,
    zIndex: 4,
  })

  const tracksLayer = new TracksLayer({
    title: 'tracksLayer',
    positions,
    visible: false,
    zIndex: 1,
  })

  const confidenceLayer = new CirclesLayer({
    positions,
    id: 'confidence',
    title: 'confidenceLayer',
    visible: false,
    zIndex: 3,
    style: {
      fill: null,
      stroke: {
        color: 'rgba(242, 201, 76, 1)',
        lineDash: [8, 8],
        width: 2,
      },
    },
  })

  const numbersLayer = new TextLayer({
    positions,
    textProperty: 'sequenceNumber',
    title: 'numberingLayer',
    visible: false,
    zIndex: 3,
  })

  emMap.addLayer(locationsLayer)
  emMap.addLayer(tracksLayer)
  emMap.addLayer(confidenceLayer)
  emMap.addLayer(numbersLayer)

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
      detail: { message: 'All custom layers added' },
    }),
  )

  emMap.fitToAllLayers()

  initialiseDateFilterForm()
}

export default initialiseLocationDataView
