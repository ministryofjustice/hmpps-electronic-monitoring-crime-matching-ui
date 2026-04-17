// Require app insights before anything else to allow for instrumentation of bunyan and express
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
    await services.playwrightBrowserService.getBrowser()
    logger.info('[playwright] browser launched at startup')
  } catch (error) {
    logger.error({ error }, '[playwright] failed to launch browser at startup')
  }

  const port = app.get('port')

  const server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`)
  })

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down`)

    server.close(async () => {
      try {
        await services.playwrightBrowserService.close()
        logger.info('[playwright] browser closed')
      } catch (error) {
        logger.warn({ error }, '[playwright] error closing browser')
      }

      process.exit(0)
    })
  }

  // Listen for termination signals to allow for graceful shutdown
  process.on('SIGTERM', () => {
    shutdown('SIGTERM').catch(error => {
      logger.error({ error }, 'SIGTERM shutdown failed')
      process.exit(1)
    })
  })

  // Also listen for SIGINT (e.g. Ctrl+C) to allow for graceful shutdown in development
  process.on('SIGINT', () => {
    shutdown('SIGINT').catch(error => {
      logger.error({ error }, 'SIGINT shutdown failed')
      process.exit(1)
    })
  })
}

// Start the server
start().catch(error => {
  logger.error({ error }, 'Startup failed')
  process.exit(1)
})
