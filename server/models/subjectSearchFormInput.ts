import z from 'zod'

const SubjectSearchFormInputModel = z.object({
  name: z.string().optional(),
  nomisId: z.string().optional(),
})

export const ParsedSubjectSearchFormInputModel = SubjectSearchFormInputModel.transform(data => {
  return {
    name: data.name,
    nomisId: data.nomisId,
  }
})

export type ParsedSubjectSearchFormInput = z.infer<typeof ParsedSubjectSearchFormInputModel>
export type SubjectSearchFormInput = z.infer<typeof SubjectSearchFormInputModel>
