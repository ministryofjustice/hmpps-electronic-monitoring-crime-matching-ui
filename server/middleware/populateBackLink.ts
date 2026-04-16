import { RequestHandler } from 'express'
import { z } from 'zod/v4'

const populateBackLink = (defaultValue: string): RequestHandler => {
  const schema = z.object({
    returnTo: z.string().default(defaultValue),
  })

  return (req, res, next) => {
    const result = schema.safeParse(req.query)

    if (result.success) {
      res.locals.backLink = result.data.returnTo
    }

    next()
  }
}

export default populateBackLink
