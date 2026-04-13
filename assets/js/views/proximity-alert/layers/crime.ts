import {
  CirclesLayer,
  LocationsLayer,
  TextLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import LayerGroup from 'ol/layer/Group'
import { CrimePosition } from '../types'

class CrimeLayer extends LayerGroup {
  constructor(crime: CrimePosition) {
    super({
      properties: {
        title: 'crime',
      },
      layers: [
        // Crime radius
        ...new CirclesLayer({
          title: 'crime-radius',
          zIndex: 1,
          visible: true,
          style: {
            fill: 'rgba(0, 0, 0, 0.12)',
            stroke: {
              color: 'rgba(0, 0, 0, 0.45)',
              width: 2,
            },
          },
          positions: [
            {
              latitude: crime.latitude,
              longitude: crime.longitude,
              // @ts-expect-error missing from type but is used
              precision: 100,
            },
          ],
        }).getLayers(),

        // Crime type label
        ...new TextLayer({
          title: 'crime-type',
          positions: [crime],
          textProperty: 'crimeTypeId',
          zIndex: 5,
          visible: true,
          style: {
            fill: '#d4351c',
            offset: { x: 0, y: 20 },
            textAlign: 'center',
          },
        }).getLayers(),

        // Marker
        ...new LocationsLayer({
          title: 'crime-marker',
          positions: [
            {
              ...crime,
              marker: {
                type: 'pin',
                pin: { color: '#d4351c' },
              },
            },
          ],
          zIndex: 10,
        }).getLayers(),
      ],
    })
  }
}

export default CrimeLayer
