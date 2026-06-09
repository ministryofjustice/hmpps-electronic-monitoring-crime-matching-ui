import express, { Express } from 'express'
import { NotFound } from 'http-errors'
import { randomUUID } from 'crypto'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

import multer from 'multer'
import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import AuditService from '../../services/auditService'
import { HmppsUser } from '../../interfaces/hmppsUser'
import setUpWebSession from '../../middleware/setUpWebSession'
import auditMiddleware from '../../middleware/auditMiddleware'
import HmppsAuditClient from '../../data/hmppsAuditClient'
import { ROLES } from '../../constants/roles'

jest.mock('../../services/auditService')
jest.mock('../../data/hmppsAuditClient')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export const hubCaseworker: HmppsUser = {
  name: 'FIRST LAST',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  authSource: 'nomis',
  staffId: 1234,
  userRoles: [ROLES.CRIME_MATCHING_HUB_CASEWORKER],
}

export const hubManager: HmppsUser = {
  ...hubCaseworker,
  userRoles: [ROLES.CRIME_MATCHING_HUB_MANAGER],
}

const hmppsAuditClient = new HmppsAuditClient({
  queueUrl: '',
  enabled: true,
  region: '',
  serviceName: '',
}) as jest.Mocked<HmppsAuditClient>

export const flashProvider = jest.fn()

function appSetup(services: Services, production: boolean, userSupplier: () => HmppsUser): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app)
  app.use(setUpWebSession())
  app.use((req, res, next) => {
    req.user = userSupplier() as Express.User
    req.flash = flashProvider
    res.locals = {
      user: { ...req.user } as HmppsUser,
    }
    next()
  })
  app.use((req, res, next) => {
    req.id = randomUUID()
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(multer().single('file'))
  app.use(auditMiddleware(services))
  app.use(routes(services))
  app.use((req, res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {
    auditService: new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>,
  },
  userSupplier = () => hubCaseworker,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => HmppsUser
}): Express {
  return appSetup(services as Services, production, userSupplier)
}
