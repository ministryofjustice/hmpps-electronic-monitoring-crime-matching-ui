import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import 'hmpps-open-layers-map'
import initialiseLocationDataView from './views/location-data'
import initialiseLocationDataDeviceActivationSearchView from './views/location-data-device-activation-search'

govukFrontend.initAll()
mojFrontend.initAll()

if (document.querySelector('.location-data')) {
  initialiseLocationDataView()
}

if (document.querySelector('.device-activation-search')) {
  initialiseLocationDataDeviceActivationSearchView()
}
