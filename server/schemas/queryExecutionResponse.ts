// eslint-disable-next-line import/no-named-as-default
import z from 'zod'

export const QueryExecutionResponseModel = z.object({
  queryExecutionId: z.string(),
})

export type QueryExecutionResponse = z.infer<typeof QueryExecutionResponseModel>
