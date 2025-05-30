import z from 'zod'

export const QueryExecutionResponseModel = z.object({
  queryExecutionId: z.string(),
})

export type QueryExecutionResponse = z.infer<typeof QueryExecutionResponseModel>
