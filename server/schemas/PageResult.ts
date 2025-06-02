// eslint-disable-next-line import/no-named-as-default
import z from 'zod'

const PageResultModel = z.object({
  pageNumber: z.number(),
  totalPages: z.number(),
  results: z.array(SubjectModel),
})

export type PageResult = z.infer<typeof PageResultModel>

export default PageResultModel
