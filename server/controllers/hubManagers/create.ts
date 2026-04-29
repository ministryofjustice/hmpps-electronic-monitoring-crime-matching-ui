import { RequestHandler } from 'express'
import HubManagersService from '../../services/hubManagerService'
import URLS from '../../constants/urls'

export default class CreateHubManagersController {
  constructor(private readonly hubManagersService: HubManagersService) {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/hubManagers/create')
  }

  submit: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { name } = req.body
    const { file } = req
    const result = await this.hubManagersService.createHubManager(username, name, file)

    if (result.ok) {
      res.redirect(303, URLS.HUB_MANAGERS.LIST)
    } else {
      res.render('pages/hubManagers/create', {
        name,
        validationErrors: result.ok ? {} : result.validationErrors,
      })
    }
  }
}
