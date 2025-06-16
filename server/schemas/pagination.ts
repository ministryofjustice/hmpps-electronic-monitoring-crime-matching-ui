import { z } from 'zod/v4'

const paginatedDtoSchema = z.object({
  pageCount: z.number(),
  pageNumber: z.number(),
  pageSize: z.number(),
})

// eslint-disable-next-line import/prefer-default-export
export { paginatedDtoSchema }
