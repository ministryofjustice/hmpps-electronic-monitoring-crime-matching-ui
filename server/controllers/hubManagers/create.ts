import { RequestHandler } from 'express'
import HubManagersService from '../../services/hubManagerService'
import URLS from '../../constants/urls'
import AuditService, { Page } from '../../services/auditService'

export default class CreateHubManagersController {
  constructor(
    private readonly auditService: AuditService,
    private readonly hubManagersService: HubManagersService,
  ) {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/hubManagers/create')
  }

  submit: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { name } = req.body
    const { file } = req
    const result = await this.hubManagersService.createHubManager(username, name, file)

    await this.auditService.logApiModificationCall('ATTEMPT', 'CREATE', Page.HUB_MANAGER, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    if (result.ok) {
      await this.auditService.logApiModificationCall('SUCCESS', 'CREATE', Page.HUB_MANAGER, {
        who: res.locals.user.username,
        correlationId: req.id,
      })
      res.redirect(303, URLS.HUB_MANAGERS.VIEW)
    } else {
      res.render('pages/hubManagers/create', {
        name,
        validationErrors: result.ok ? {} : result.validationErrors,
      })
    }
  }
}
