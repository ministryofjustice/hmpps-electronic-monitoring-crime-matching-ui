import { createAll } from 'govuk-frontend'
import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import initialiseLocationDataView from './views/location-data'
import initialiseLocationDataDeviceActivationSearchView from './views/location-data-device-activation-search'
import initialiseProximityAlertView from './views/proximity-alert/crimeVersion'
import components from './components'

govukFrontend.initAll()
mojFrontend.initAll()

// Initialise EMAC custom components
for (const Component of components) {
  createAll(Component, undefined, undefined)
}

if (document.querySelector('.location-data')) {
  initialiseLocationDataView()
}

if (document.querySelector('.device-activation-search')) {
  initialiseLocationDataDeviceActivationSearchView()
}

if (document.querySelector('.proximity-alert')) {
  initialiseProximityAlertView()
}
