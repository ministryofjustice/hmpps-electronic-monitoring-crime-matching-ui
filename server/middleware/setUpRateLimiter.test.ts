import express from 'express'
import request from 'supertest'
import { RedisStore } from 'rate-limit-redis'
import logger from '../../logger'
import config from '../config'
import { createRedisClient } from '../data/redisClient'
import setUpRateLimiter from './setUpRateLimiter'

jest.mock('../../logger')
jest.mock('../config', () => ({
  __esModule: true,
  default: { redis: { enabled: false } },
}))
jest.mock('../data/redisClient')
jest.mock('rate-limit-redis', () => ({ RedisStore: jest.fn() }))

describe('setUpRateLimiter', () => {
  const warn = jest.mocked(logger.warn)
  const error = jest.mocked(logger.error)
  let redisStoreOptions: { prefix: string; sendCommand: (...args: string[]) => Promise<unknown> }

  beforeEach(() => {
    config.redis.enabled = true
    jest.clearAllMocks()
    jest.mocked(createRedisClient).mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      sendCommand: jest.fn(),
    } as unknown as ReturnType<typeof createRedisClient>)

    let totalHits = 0
    jest.mocked(RedisStore).mockImplementation(options => {
      redisStoreOptions = options as unknown as typeof redisStoreOptions
      return {
        init: jest.fn(),
        increment: jest.fn(() => {
          totalHits += 1
          return { totalHits, resetTime: new Date() }
        }),
        decrement: jest.fn(),
        resetKey: jest.fn(),
      } as unknown as RedisStore
    })
  })

  it('returns 429 after the configured Redis-backed request limit is exceeded', async () => {
    const app = express()
    app.use(setUpRateLimiter({ limit: 1, windowMs: 60_000 }))
    app.get('/', (_request, response) => response.sendStatus(200))

    await request(app).get('/').expect(200)
    await request(app).get('/').expect(429)

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        rateLimit: expect.not.objectContaining({ key: expect.anything() }),
      }),
      'client was rate limited',
    )
  })

  it('configures the Redis store with the shared Redis client', async () => {
    const sendCommand = jest.fn().mockResolvedValue('OK')
    const connect = jest.fn().mockResolvedValue(undefined)
    jest
      .mocked(createRedisClient)
      .mockReturnValue({ connect, sendCommand } as unknown as ReturnType<typeof createRedisClient>)

    setUpRateLimiter()

    expect(RedisStore).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: 'hmpps-electronic-monitoring-crime-matching-ui:rate-limit:' }),
    )
    expect(connect).toHaveBeenCalledTimes(1)

    await redisStoreOptions.sendCommand('PING')
    expect(sendCommand).toHaveBeenCalledWith(['PING'])
  })

  it('logs Redis connection failures without preventing rate limiter setup', async () => {
    const connectionError = new Error('Redis unavailable')
    jest.mocked(createRedisClient).mockReturnValue({
      connect: jest.fn().mockRejectedValue(connectionError),
      sendCommand: jest.fn(),
    } as unknown as ReturnType<typeof createRedisClient>)

    expect(() => setUpRateLimiter()).not.toThrow()
    await Promise.resolve()

    expect(error).toHaveBeenCalledWith('Error connecting to Redis for rate limiting', connectionError)
  })
})
