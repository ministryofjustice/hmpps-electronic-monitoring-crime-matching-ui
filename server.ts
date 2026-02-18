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
    logger.info('[playwright] shared browser launched at startup')
  } catch (err) {
    logger.error('[playwright] failed to launch browser at startup', err)
  }
}

start().catch(err => {
  logger.error('Startup failed', err)
  process.exit(1)
})

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})
