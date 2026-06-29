import {
  CirclesLayer,
  LocationsLayer,
  TextLayer,
  TracksLayer,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/layers'
import LayerGroup from 'ol/layer/Group'
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
          zIndex: 5,
          visible: true,
        }).getLayers(),

        // Confidence circles
        ...new CirclesLayer({
          title: `device-wearer-circles-${deviceId}`,
          positions,
          visible: true,
          zIndex: 3,
          style: {
            fill: null,
            stroke: {
              color: 'rgba(242, 201, 76, 1)',
              lineDash: [8, 8],
              width: 2,
            },
          },
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
