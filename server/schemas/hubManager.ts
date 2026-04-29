import { z } from 'zod/v4'

const hubManagerSchema = z.object({
  id: z.string(),
  name: z.string(),
  hasSignature: z.boolean(),
})

const getHubManagerDtoSchema = z.object({
  data: hubManagerSchema,
})

const getHubManagersDtoSchema = z.object({
  data: z.array(hubManagerSchema),
})

export { getHubManagerDtoSchema, getHubManagersDtoSchema }
