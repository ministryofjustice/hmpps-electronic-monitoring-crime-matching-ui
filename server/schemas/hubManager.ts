import { z } from 'zod/v4'

const hubManagerSchema = z.object({
  id: z.string(),
  name: z.string(),
  occupation: z.string().default('MoJ EM Hub Manager'),
  hasSignature: z.boolean(),
})

const getHubManagerDtoSchema = z.object({
  data: hubManagerSchema,
})

const getHubManagersDtoSchema = z.object({
  data: z.array(hubManagerSchema),
})

export { getHubManagerDtoSchema, getHubManagersDtoSchema }
