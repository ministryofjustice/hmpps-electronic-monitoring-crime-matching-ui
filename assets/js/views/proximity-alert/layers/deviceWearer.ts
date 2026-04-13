import {
  LocationsLayer,
  TextLayer,
  TracksLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import LayerGroup from 'ol/layer/Group'
import { CrimePosition, WearerPosition } from '../types'

class DeviceWearerLayer extends LayerGroup {
  constructor(deviceId: number, crime: CrimePosition, positions: Array<WearerPosition>, colour: string) {
    super({
      properties: {
        title: `device-wearer-${deviceId}`,
      },
      layers: [
        // Tracks
        ...new TracksLayer({
          title: `device-wearer-tracks-${deviceId}`,
          positions,
          entryExit: {
            enabled: true,
            extensionDistanceMeters: 100,
            centre: [crime.latitude, crime.longitude],
            radiusMeters: 100,
          },
          zIndex: 2,
          visible: false,
        }).getLayers(),

        // Labels
        ...new TextLayer({
          title: `device-wearer-labels-${deviceId}`,
          positions,
          textProperty: 'sequenceLabel',
          zIndex: 5,
          visible: true,
        }).getLayers(),

        // Locations
        ...new LocationsLayer({
          title: `device-wearer-positions-${deviceId}`,
          positions,
          zIndex: 4,
          style: {
            fill: colour,
            stroke: { color: colour, width: 0 },
          },
        }).getLayers(),
      ],
    })
  }
}

export default DeviceWearerLayer
