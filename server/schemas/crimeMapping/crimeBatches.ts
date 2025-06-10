import z from 'zod'

const crimeBatchesQuerySchema = z.object({
  searchId: z.string().optional(),
})

export { crimeBatchesQuerySchema }
