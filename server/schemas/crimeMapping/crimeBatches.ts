import { z } from 'zod'

const crimeBatchesQuerySchema = z.object({
  queryId: z.string().optional(),
})

const createCrimeBatchesQueryDtoSchema = z.object({
  queryExecutionId: z.string(),
})

const getCrimeBatchesQueryDtoSchema = z.array(
  z.object({
    policeForce: z.string(),
    batch: z.string(),
    start: z.string(),
    end: z.string(),
    time: z.number(),
    distance: z.number(),
    matches: z.number(),
  }),
)

export { crimeBatchesQuerySchema, createCrimeBatchesQueryDtoSchema, getCrimeBatchesQueryDtoSchema }
