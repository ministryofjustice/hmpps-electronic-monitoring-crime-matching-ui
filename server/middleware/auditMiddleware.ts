import { NextFunction, Request, Response, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from './asyncMiddleware'
import { Page, PageViewEventDetails } from '../services/auditService'
import URLS from '../constants/urls'

const pageViewEventMap: Record<string, Page> = {
  [URLS.HUB_MANAGERS.VIEW]: Page.HUB_MANAGERS,
  [URLS.LOCATION_DATA.DEVICE_ACTIVATION.VIEW]: Page.LOCATION_DATA_DEVICE_ACTIVATION,
  [URLS.LOCATION_DATA.DEVICE_ACTIVATIONS.VIEW]: Page.LOCATION_DATA_DEVICE_ACTIVATIONS,
  [URLS.POLICE_DATA.INGESTION_ATTEMPT.VIEW]: Page.POLICE_DATA_INGESTION_ATTEMPT,
  [URLS.POLICE_DATA.INGESTION_ATTEMPTS.VIEW]: Page.POLICE_DATA_INGESTION_ATTEMPTS,
  [URLS.PROXIMITY_ALERT.CRIME_VERSION.VIEW]: Page.PROXIMITY_ALERT_CRIME_VERSION,
  [URLS.PROXIMITY_ALERT.CRIME_VERSIONS.VIEW]: Page.PROXIMITY_ALERT_CRIME_VERSIONS,
}

export default function auditMiddleware({ auditService }: Services) {
  const auditPageView = (route: string) =>
    // Creates middleware per route
    asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
      // Assign page based on route
      const page = pageViewEventMap[route]

      // Skip if no page listed in expected routes
      if (!page) return next()

      // Generic audit details set
      const auditDetails: PageViewEventDetails = {
        who: req.user?.username ?? 'UNKNOWN',
        correlationId: req.id,
        details: {
          params: req.params,
          query: req.query,
        },
      }

      auditService.logPageViewAttempt(page, auditDetails)

      // Log a view if successful
      res.prependOnceListener('finish', () => {
        if (res.statusCode === 200) {
          auditService.logPageView(page, auditDetails)
        }
      })

      return next()
    })

  const router = Router()
  // Attach middleware to all routes
  Object.keys(pageViewEventMap).forEach(route => router.get(route, auditPageView(route)))

  return router
}
