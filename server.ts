// Require app insights before anything else to allow for instrumentation of bunyan and express
import 'applicationinsights'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import app from './server/index'
import logger from './logger'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Europe/London')

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})
