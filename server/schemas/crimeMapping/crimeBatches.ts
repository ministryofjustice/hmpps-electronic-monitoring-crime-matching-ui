import z from 'zod'

const crimeBatchesQuerySchema = z.object({
  queryId: z.string().optional(),
})

export { crimeBatchesQuerySchema }
