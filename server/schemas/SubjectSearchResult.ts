// eslint-disable-next-line import/no-named-as-default
import z from 'zod'
import { SubjectModel } from './subject'

const SubjectSearchResultModel = z.object({
  page: z.number(),
  totalPages: z.number(),
  results: z.array(SubjectModel),
})

export type SubjectSearchResult = z.infer<typeof SubjectSearchResultModel>

export default SubjectSearchResultModel
