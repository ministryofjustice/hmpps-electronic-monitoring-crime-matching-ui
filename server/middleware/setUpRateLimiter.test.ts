import express from 'express'
import request from 'supertest'
import logger from '../../logger'
import setUpRateLimiter from './setUpRateLimiter'

jest.mock('../../logger')

describe('setUpRateLimiter', () => {
  const warn = jest.mocked(logger.warn)

  beforeEach(() => {
    warn.mockClear()
  })

  it('returns 429 after the configured request limit is exceeded', async () => {
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

  it('does not limit requests when disabled', async () => {
    const app = express()
    app.use(setUpRateLimiter({ enabled: false }))
    app.get('/', (_request, response) => response.sendStatus(200))

    await request(app).get('/').expect(200)
    await request(app).get('/').expect(200)
  })
})
