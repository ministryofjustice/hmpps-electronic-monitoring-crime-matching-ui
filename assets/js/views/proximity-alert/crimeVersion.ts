import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { fromLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'
import { queryElement } from '../../utils/utils'
import CrimeLayer from './layers/crime'
import DeviceWearerLayer from './layers/deviceWearer'
import { CrimePosition, WearerPosition } from './types'
import initialiseProximityAlertForm from '../../forms/proximity-alert'

type ProximityAlertMapPosition = WearerPosition | CrimePosition

const palette = [
  '#d00050',
  '#fffb06',
  '#1065f9',
  '#69c9ff',
  '#d87300',
  '#a900bc',
  '#965a00',
  '#904aff',
  '#a492ff',
  '#ffc7ea',
  '#f3c715',
  '#00a775',
  '#1e2db0',
  '#acacac',
  '#0693e2',
  '#8fbb00',
]

// Add a Crime marker layers
const addCrimeLayers = (emMap: EmMap, crime: CrimePosition): { centre: Coordinate } => {
  const centre = fromLonLat([crime.longitude, crime.latitude])

  emMap.addLayerGroup(new CrimeLayer(crime))

  return { centre }
}

// Default map view
const setCrimeDefaultView = (emMap: EmMap, centre: Coordinate) => {
  const map = emMap.olMapInstance!
  map.getView().setCenter(centre)
  map.getView().setZoom(16.5)
}

const initialiseProximityAlertView = async () => {
  const emMap = queryElement(document, 'em-map') as EmMap

  await new Promise<void>(resolve => {
    emMap.addEventListener('map:ready', () => resolve(), { once: true })
  })

  const allPositions = emMap.positions as ProximityAlertMapPosition[]

  const crime = allPositions.find(p => p.positionType === 'crime') as CrimePosition | undefined
  if (!crime) throw new Error('No crime position found in positions[] (expected one with positionType="crime")')

  const wearerPositions = allPositions.filter(p => p.positionType === 'wearer') as WearerPosition[]

  const { centre } = addCrimeLayers(emMap, crime)

  setCrimeDefaultView(emMap, centre)

  // Group wearer positions by device wearer
  const positionsByWearer = new Map<number, WearerPosition[]>()
  for (const pos of wearerPositions) {
    const key = pos.deviceId
    const list = positionsByWearer.get(key) ?? []
    list.push(pos)
    positionsByWearer.set(key, list)
  }

  let colourIndex = 0
  for (const [deviceId, positions] of positionsByWearer.entries()) {
    const colour = palette[colourIndex % palette.length]
    colourIndex += 1

    emMap.addLayerGroup(new DeviceWearerLayer(deviceId, crime, positions, colour))
  }

  emMap.dispatchEvent(
    new CustomEvent('app:map:layers:ready', {
      bubbles: true,
      composed: true,
    }),
  )

  initialiseProximityAlertForm()
}

export default initialiseProximityAlertView
