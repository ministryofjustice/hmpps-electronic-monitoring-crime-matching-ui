import { RequestHandler } from 'express'
import HubManagersService from '../../services/hubManagerService'

export default class ListHubManagersController {
  constructor(private readonly hubManagersService: HubManagersService) {}

  delete: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { id } = req.params

    await this.hubManagersService.deleteHubManager(username, id)

    res.redirect(303, '/hub-managers')
  }

  view: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const result = await this.hubManagersService.getHubManagers(username)

    res.render('pages/hubManagers/list', {
      hubManagers: result.ok ? result.data : [],
    })
  }
}
