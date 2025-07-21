import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import initSubjectSelect from './subjectSelect'
import initialiseLocationDataView from './views/location-data'

govukFrontend.initAll()
mojFrontend.initAll()
initSubjectSelect()

if (document.querySelector('.location-data')) {
  initialiseLocationDataView()
}
