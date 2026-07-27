import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'

// Sets the map's OS copyright attribution using the em-map component's built-in
// attribution API. Must be called after the map has fired 'map:ready'.
const setMapAttribution = (emMap: EmMap) => {
  const currentYear = new Date().getFullYear()

  emMap.setAttribution(`Contains OS data © Crown copyright and database rights ${currentYear}`)
}

export default setMapAttribution
