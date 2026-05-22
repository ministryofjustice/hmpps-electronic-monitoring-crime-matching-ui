import express, { Router } from 'express'
import {
  monitoringMiddleware,
  endpointHealthComponent,
  type HealthComponent,
  type ComponentHealthResult,
} from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import type PlaywrightBrowserService from '../services/proximityAlert/playwrightBrowserService'
import logger from '../../logger'
import config from '../config'

const playwrightComponent = (playwrightBrowserService: PlaywrightBrowserService): HealthComponent => ({
  isEnabled: () => true,

  health: async (): Promise<ComponentHealthResult> => ({
    name: 'playwright',
    status: playwrightBrowserService.isReady() ? 'UP' : 'DOWN',
  }),
})

export default function setUpHealthChecks(
  applicationInfo: ApplicationInfo,
  playwrightBrowserService: PlaywrightBrowserService,
): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis)
  const playwrightHealthComponent = playwrightComponent(playwrightBrowserService)

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: [
      ...apiConfig.map(([name, options]) => endpointHealthComponent(logger, name, options)),
      playwrightHealthComponent,
    ],
  })

  router.get('/readiness', async (_req, res, next) => {
    try {
      const playwrightHealth = await playwrightHealthComponent.health()

      return res.status(playwrightHealth.status === 'UP' ? 200 : 503).json({
        status: playwrightHealth.status,
        components: {
          [playwrightHealth.name]: { status: playwrightHealth.status },
        },
      })
    } catch (error) {
      return next(error)
    }
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
