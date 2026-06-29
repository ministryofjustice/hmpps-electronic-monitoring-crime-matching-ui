import { RequestHandler } from 'express'
import HubManagersService from '../../services/hubManagerService'
import URLS from '../../constants/urls'
import AuditService, { Page } from '../../services/auditService'

export default class ListHubManagersController {
  constructor(
    private readonly auditService: AuditService,
    private readonly hubManagersService: HubManagersService,
  ) {}

  delete: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { id } = req.params

    await this.auditService.logApiModificationCall('ATTEMPT', 'DELETE', Page.HUB_MANAGER, {
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        params: {
          id,
        },
      },
    })

    await this.hubManagersService.deleteHubManager(username, id)

    await this.auditService.logApiModificationCall('SUCCESS', 'DELETE', Page.HUB_MANAGER, {
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        params: {
          id,
        },
      },
    })

    res.redirect(303, URLS.HUB_MANAGERS.VIEW)
  }

  view: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const result = await this.hubManagersService.getHubManagers(username)

    res.render('pages/hubManagers/list', {
      hubManagers: result.ok ? result.data : [],
    })
  }
}
