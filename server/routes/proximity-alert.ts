import { Router, type Response } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import CrimeSearchController from '../controllers/proximityAlert/crimeSearch'
import CrimeVersionController from '../controllers/proximityAlert/crimeVersion'
import MapImageRendererService from '../services/proximityAlert/proximityAlertMapImageService'
import ProximityAlertReportDocxService from '../services/proximityAlert/proximityAlertReportDocxService'
import populateBackLink from '../middleware/populateBackLink'
import URLS from '../constants/urls'

const proximityAlertRoutes = ({ crimeService, hubManagersService, playwrightBrowserService }: Services): Router => {
  const router = Router()
  const crimeSearchController = new CrimeSearchController(crimeService)
  const mapImageRendererService = new MapImageRendererService()
  const proximityAlertReportDocxService = new ProximityAlertReportDocxService()

  const crimeVersionController = new CrimeVersionController(
    crimeService,
    playwrightBrowserService,
    mapImageRendererService,
    proximityAlertReportDocxService,
    hubManagersService,
  )

  router.get(URLS.PROXIMITY_ALERT.CRIME_VERSIONS.VIEW, asyncMiddleware(crimeSearchController.view))
  router.post(URLS.PROXIMITY_ALERT.CRIME_VERSIONS.VIEW, asyncMiddleware(crimeSearchController.search))

  router.get(
    URLS.PROXIMITY_ALERT.CRIME_VERSION.VIEW,
    populateBackLink(URLS.PROXIMITY_ALERT.CRIME_VERSIONS.VIEW),
    asyncMiddleware(crimeVersionController.view),
  )

  // Ensure that when signing in, the redirected route doesn't land the user on the export action route
  router.get(URLS.PROXIMITY_ALERT.CRIME_VERSION.EXPORT, (res: Response) => {
    res.redirect(URLS.PROXIMITY_ALERT.CRIME_VERSION.VIEW)
  })

  router.post(URLS.PROXIMITY_ALERT.CRIME_VERSION.EXPORT, asyncMiddleware(crimeVersionController.exportProximityAlert))

  return router
}

export default proximityAlertRoutes
