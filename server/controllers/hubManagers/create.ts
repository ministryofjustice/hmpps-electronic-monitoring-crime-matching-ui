import { RequestHandler } from 'express'
import z from 'zod'
import HubManagersService from '../../services/hubManagerService'

const schema = z.object({
  name: z.string().default(''),
})

export default class CreateHubManagersController {
  constructor(private readonly hubManagersService: HubManagersService) {}

  view: RequestHandler = async (req, res) => {
    res.render('pages/hubManagers/create')
  }

  submit: RequestHandler = async (req, res) => {
    const { username } = res.locals.user
    const { name } = schema.parse(req.body)
    const { file } = req
    const result = await this.hubManagersService.createHubManagerWithSignature(username, name, file)

    if (result.ok) {
      res.redirect(303, '/hub-managers')
    } else {
      res.render('pages/hubManagers/create', {
        name,
        validationErrors: result.ok ? {} : result.validationErrors,
      })
    }
  }
}
