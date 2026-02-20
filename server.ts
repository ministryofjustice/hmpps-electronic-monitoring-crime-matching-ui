import 'applicationinsights'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

import { app, services } from './server/index'
import logger from './logger'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

async function start(): Promise<void> {
  try {
    // Pre-launch Playwright browser used to screenshot map images
    await services.playwrightBrowserService.getBrowser()
    logger.info('[playwright] browser launched at startup')
  } catch (err) {
    logger.error('[playwright] failed to launch browser at startup', err)
  }

  const port = app.get('port')

  const server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`)
  })

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down`)

    server.close(async () => {
      try {
        await services.playwrightBrowserService.close()
        logger.info('[playwright] browser closed')
      } catch (err) {
        logger.warn('[playwright] error closing browser', err)
      }

      process.exit(0)
    })
  }

  // When the Node process stops: release HTTP port and close Playwright browser
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

start().catch(err => {
  logger.error('Startup failed', err)
  process.exit(1)
})
