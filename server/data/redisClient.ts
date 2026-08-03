import { createClient } from 'redis'

import logger from '../../logger'
import config from '../config'

// Derived from createRedisClient's own return type below, rather than ReturnType<typeof createClient>,
// because createClient's default RESP version (2) is incompatible with the RESP 3 client constructed here.
export type RedisClient = ReturnType<typeof createRedisClient>

const url =
  config.redis.tls_enabled === 'true'
    ? `rediss://${config.redis.host}:${config.redis.port}`
    : `redis://${config.redis.host}:${config.redis.port}`

export const createRedisClient = () => {
  const client = createClient({
    RESP: 3,
    url,
    password: config.redis.password,
    socket: {
      reconnectStrategy: (attempts: number) => {
        // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
        const nextDelay = Math.min(2 ** attempts * 20, 30000)
        logger.info(`Retry Redis connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`)
        return nextDelay
      },
    },
  })

  client.on('error', (e: Error) => logger.error('Redis client error', e))

  return client
}
