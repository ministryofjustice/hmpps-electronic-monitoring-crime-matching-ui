import { RequestHandler } from 'express'
import FeaturesService from '../services/featuresService'
import presentHomepageFeatures from '../presenters/homepageFeatures'
import AuditService, { Page } from '../services/auditService'

class HomepageController {
  constructor(
    private readonly auditService: AuditService,
    private readonly featuresService: FeaturesService,
  ) {}

  view: RequestHandler = async (req, res) => {
    await this.auditService.logPageView(Page.HOMEPAGE, { who: res.locals.user.username, correlationId: req.id })

    const features = this.featuresService.getFeaturesForUser(res.locals.user)

    res.render('pages/index', {
      features: presentHomepageFeatures(features),
    })
  }
}

export default HomepageController
