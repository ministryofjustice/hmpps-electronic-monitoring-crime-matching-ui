import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'

const OS_TERMS_AND_CONDITIONS_URL = 'https://www.ordnancesurvey.co.uk/legal'

// Sets the map's OS copyright attribution using the em-map component's built-in
// attribution API. Must be called after the map has fired 'map:ready'.
// Includes a hyperlink to the OS terms and conditions, per os-maps-licensing.txt.
const setMapAttribution = (emMap: EmMap) => {
  const currentYear = new Date().getFullYear()

  emMap.setAttribution(
    `Contains OS data © Crown copyright and database rights ${currentYear}. Use of this data is subject to ` +
      `<a href="${OS_TERMS_AND_CONDITIONS_URL}" target="_blank" rel="noopener noreferrer">terms and conditions</a>`,
    { allowHtml: true },
  )
}

export default setMapAttribution
