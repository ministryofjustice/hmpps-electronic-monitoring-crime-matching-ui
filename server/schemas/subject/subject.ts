// eslint-disable-next-line import/no-named-as-default
import z from 'zod'

const MISSING_FORM_VALUE_ERROR = 'You must enter a value for either Name or NOMIS ID'

const subjectsQueryParametersSchema = z.object({
  queryId: z.string().optional(),
})

const subjectsFormDataSchema = z
  .object({
    name: z.string(),
    nomisId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (Object.values(data).every(value => value === '' || value === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MISSING_FORM_VALUE_ERROR,
        path: ['name'],
      })
    }
  })

const createSubjectsQueryDtoSchema = z.object({
  queryExecutionId: z.string(),
})

const getSubjectsQueryDtoSchema = z.array(
  z.object({
    nomisId: z.string(),
    name: z.string(),
    dateOfBirth: z.string(),
    address: z.string(),
    orderStartDate: z.string(),
    orderEndDate: z.string().nullable(),
    deviceId: z.string(),
    tagPeriodStartDate: z.string(),
    tagPeriodEndDate: z.string().nullable(),
  }),
)

export {
  subjectsQueryParametersSchema,
  subjectsFormDataSchema,
  createSubjectsQueryDtoSchema,
  getSubjectsQueryDtoSchema,
}
