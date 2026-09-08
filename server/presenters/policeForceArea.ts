import { policeForceAreas } from '../data/policeForceAreas'
import { withFallback } from './helpers/formatters'

const presentPoliceForceArea = (policeForceArea: string): string => {
  return withFallback(policeForceAreas.get(policeForceArea))
}

export default presentPoliceForceArea
