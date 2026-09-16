import express, { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import logger from '../../logger'

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

  router.use(
    rateLimit({
      windowMs,
      limit,
      handler: (request, response, next, options) => {
        logger.warn('client was rate limited', request.rateLimit)
        response.status(options.statusCode).send(options.message)
      },
    }),
  )

  return router
}
