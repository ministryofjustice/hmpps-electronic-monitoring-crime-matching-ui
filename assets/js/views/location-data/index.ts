import { EmMap, type Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import {
  LocationsLayer,
  TracksLayer,
  CirclesLayer,
  TextLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import { queryElement } from '../../utils/utils'
import initialiseDateFilterForm from '../../forms/date-filter-form'

type PositionWithGeolocationMechanism = Position & {
  geolocationMechanism: 'GPS' | 'RF' | 'LBS' | 'WIFI'
  displaySequenceNumber?: string
}

const initialiseLocationDataView = async () => {
  const emMap = queryElement(document, 'em-map') as EmMap

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const positions = emMap.positions as Array<PositionWithGeolocationMechanism>

  const gpsLocations = positions.filter(position => position.geolocationMechanism === 'GPS')

  const addLocationsLayer = (includeAllLocations: boolean) => {
    emMap.removeLayer('locationsLayer')
    emMap.addLayer(
      new LocationsLayer({
        id: 'locationsLayer',
        title: 'locationsLayer',
        positions: includeAllLocations ? positions : gpsLocations,
        visible: document.querySelector<HTMLInputElement>('[value="locationsLayer"]')?.checked ?? false,
        zIndex: 4,
      }),
    )
  }

  const addNumberingLayer = (includeAllLocations: boolean) => {
    const positionsToNumber = includeAllLocations ? positions : gpsLocations
    const numberedPositions = positionsToNumber.map((position, index) => ({
      ...position,
      displaySequenceNumber: index + 1,
    }))
    emMap.removeLayer('numberingLayer')
    emMap.addLayer(
      new TextLayer({
        id: 'numberingLayer',
        title: 'numberingLayer',
        positions: numberedPositions,
        textProperty: 'displaySequenceNumber',
        visible: document.querySelector<HTMLInputElement>('[value="numberingLayer"]')?.checked ?? false,
        zIndex: 3,
      }),
    )
  }

  const addTracksLayer = (includeAllLocations: boolean) => {
    emMap.removeLayer('tracksLayer')
    emMap.addLayer(
      new TracksLayer({
        id: 'tracksLayer',
        title: 'tracksLayer',
        positions: includeAllLocations ? positions : gpsLocations,
        visible: document.querySelector<HTMLInputElement>('[value="tracksLayer"]')?.checked ?? false,
        zIndex: 1,
      }),
    )
  }

  const addConfidenceLayer = (includeAllLocations: boolean) => {
    emMap.removeLayer('confidenceLayer')
    emMap.addLayer(
      new CirclesLayer({
        positions: includeAllLocations ? positions : gpsLocations,
        id: 'confidenceLayer',
        title: 'confidenceLayer',
        visible: document.querySelector<HTMLInputElement>('[value="confidenceLayer"]')?.checked ?? false,
        zIndex: 3,
        style: {
          fill: null,
          stroke: {
            color: 'rgba(242, 201, 76, 1)',
            lineDash: [8, 8],
            width: 2,
          },
        },
      }),
    )
  }

  addLocationsLayer(false)
  addConfidenceLayer(false)
  addTracksLayer(false)
  addNumberingLayer(false)

  // Event listener to update layers to include all sources
  document.addEventListener('app:location-data:all-sources-changed', event => {
    const { allSourcesEnabled } = (event as CustomEvent<{ allSourcesEnabled: boolean }>).detail
    addLocationsLayer(allSourcesEnabled)
    addConfidenceLayer(allSourcesEnabled)
    addTracksLayer(allSourcesEnabled)
    addNumberingLayer(allSourcesEnabled)
  })

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
