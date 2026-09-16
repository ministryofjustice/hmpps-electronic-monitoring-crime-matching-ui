import express, { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import logger from '../../logger'
import config from '../config'
import { createRedisClient } from '../data/redisClient'

export default function setUpRateLimiter({
  windowMs = 5 * 60 * 1000,
  limit = 100,
  enabled = true,
}: {
  windowMs?: number
  limit?: number
  enabled?: boolean
} = {}): Router {
  const router = express.Router()

  if (!enabled) {
    return router
  }

  let store: RedisStore | undefined
  if (config.redis.enabled) {
    const client = createRedisClient()
    client.connect().catch((error: Error) => logger.error('Error connecting to Redis for rate limiting', error))
    store = new RedisStore({
      prefix: 'hmpps-electronic-monitoring-crime-matching-ui:rate-limit:',
      sendCommand: (...args: string[]) => client.sendCommand(args),
    })
  }

  router.use(
    rateLimit({
      windowMs,
      limit,
      store,
      handler: (request, response, next, options) => {
        const { key, ...rateLimitDetails } = request.rateLimit ?? {}
        logger.warn(
          { requestId: request.id, method: request.method, rateLimit: rateLimitDetails },
          'client was rate limited',
        )
        response.status(options.statusCode).send(options.message)
      },
    }),
  )

  return router
}
