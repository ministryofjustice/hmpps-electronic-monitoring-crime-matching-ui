import {
  CirclesLayer,
  LocationsLayer,
  TextLayer,
  TracksLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import LayerGroup from 'ol/layer/Group'
import VectorLayer from 'ol/layer/Vector'
import { Stroke, Style } from 'ol/style'
import { Position } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'

type PositionWithSequenceLabel = Position & {
  sequenceLabel?: string
}

// Extracts the sequence key from a sequence label, e.g. "A1" -> "A", "B2" -> "B", "unknown" if no match.
const sequenceKeyFromLabel = (sequenceLabel?: string): string => sequenceLabel?.match(/^[A-Za-z]+/)?.[0] ?? 'unknown'

// Tracks should be drawn independently for each matching sequence, e.g. A1/A2/A3 and B1/B2/B3.
const groupPositionsBySequence = (positions: Array<PositionWithSequenceLabel>) => {
  const groups = new Map<string, Array<PositionWithSequenceLabel>>()

  positions.forEach(position => {
    const sequenceKey = sequenceKeyFromLabel(position.sequenceLabel)
    const existingGroup = groups.get(sequenceKey)

    if (existingGroup) {
      // Add to the existing group for this sequence key
      existingGroup.push(position)
    } else {
      // Create a new group for this sequence key
      groups.set(sequenceKey, [position])
    }
  })

  return Array.from(groups.entries())
}

const createConfidenceCircles = (deviceId: number, positions: Array<PositionWithSequenceLabel>, colour: string) => {
  const confidenceCircles = new CirclesLayer({
    title: `device-wearer-circles-${deviceId}`,
    positions,
    visible: true,
    zIndex: 6,
  })
  const layer = confidenceCircles.getPrimaryLayer()

  if (layer instanceof VectorLayer) {
    const confidenceCircleDashes = new Style({
      stroke: new Stroke({
        color: colour,
        lineDash: [8, 3],
        lineCap: 'round',
        width: 1.5,
      }),
    })
    const confidenceCircleHalo = new Style({
      stroke: new Stroke({
        color: '#ffffff',
        width: 3,
      }),
    })
    layer.setStyle([confidenceCircleHalo, confidenceCircleDashes])
  }

  return confidenceCircles.getLayers()
}

class DeviceWearerLayer extends LayerGroup {
  constructor(deviceId: number, crime: Position, positions: Array<PositionWithSequenceLabel>, colour: string) {
    super({
      properties: {
        title: `device-wearer-${deviceId}`,
      },
      layers: [
        // Tracks
        ...groupPositionsBySequence(positions).flatMap(([sequenceKey, sequencePositions]) =>
          new TracksLayer({
            title: `device-wearer-tracks-${deviceId}-${sequenceKey}`,
            positions: sequencePositions,
            entryExit: {
              enabled: true,
              extensionDistanceMeters: 50,
              direction: {
                property: { entry: 'entryBearing', exit: 'exitBearing' },
                units: 'degrees',
              },
              centre: [crime.longitude, crime.latitude],
              radiusMeters: crime.precision,
            },
            zIndex: 2,
            visible: false,
          }).getLayers(),
        ),

        // Labels
        ...new TextLayer({
          title: `device-wearer-labels-${deviceId}`,
          positions,
          textProperty: 'sequenceLabel',
          zIndex: 8,
          visible: true,
        }).getLayers(),

        // Confidence circles
        ...createConfidenceCircles(deviceId, positions, 'rgba(242, 201, 76, 1)'),

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
