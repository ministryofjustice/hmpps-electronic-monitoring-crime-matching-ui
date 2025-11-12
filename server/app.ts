import express from 'express'

import type { HTTPError } from 'superagent'
import createError from 'http-errors'
import pdsComponents from '@ministryofjustice/hmpps-probation-frontend-components'
import {
  CacheClient,
  emOrdnanceSurveyAuth,
} from '@ministryofjustice/hmpps-electronic-monitoring-components/map/ordnance-survey-auth'
import config from './config'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { createRedisClient } from './data/redisClient'
import logger from '../logger'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'
import type { Services } from './services'

// Loads Probation Design System components into the request
async function loadPdsComponents(req: express.Request, res: express.Response): Promise<void> {
  return new Promise((resolve, reject) => {
    const pdsMiddleware = pdsComponents.getPageComponents({
      pdsUrl: config.apis.probationApi.url,
      logger,
    })

    pdsMiddleware(req, res, (err?: unknown) => (err ? reject(err) : resolve()))
  })
}

export default function createApp(services: Services): express.Application {
  let redisClient: CacheClient | undefined
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  // Ordnance Survey Maps middleware
  // Serves map vector styles and resources from OS Maps API with appropriate caching
  // Connect Redis client for OS tile caching
  if (config.redis.enabled) {
    redisClient = createRedisClient()
    redisClient.connect?.().catch((err: Error) => logger.error(`Error connecting to Redis`, err))
  }

  app.use(
    emOrdnanceSurveyAuth({
      apiKey: config.maps.apiKey,
      apiSecret: config.maps.apiSecret,
      redisClient,
    }),
  )

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())

  app.get(
    '*',
    pdsComponents.getPageComponents({
      pdsUrl: config.apis.probationApi.url,
      logger,
    }),
  )

  app.use(routes(services))

  // Handle 404s with header/footer
  app.use(async (req, res, next) => {
    try {
      await loadPdsComponents(req, res)
    } catch (e) {
      logger.warn('Failed to load PDS components for 404 page', e)
    }

    next(createError(404, 'Not found'))
  })

  // Handle all other errors (500 etc.) with PBS header/footer
  app.use(async (appError: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const handleError = errorHandler(process.env.NODE_ENV === 'production')

    try {
      await loadPdsComponents(req, res)
    } catch (componentError) {
      logger.warn('Failed to load PDS components for error page', componentError)
    }

    const errorObject: Error & { status?: number } = appError instanceof Error ? appError : new Error(String(appError))
    handleError(errorObject as unknown as HTTPError, req, res, next)
  })

  return app
}
