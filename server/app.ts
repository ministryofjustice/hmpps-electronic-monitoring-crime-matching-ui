import express from 'express'

import createError from 'http-errors'
import { CacheClient, mojOrdnanceSurveyAuth } from 'hmpps-open-layers-map/ordnance-survey-auth'
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
    mojOrdnanceSurveyAuth({
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

  app.use(routes(services))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
