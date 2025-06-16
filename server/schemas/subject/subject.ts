import { z } from 'zod/v4'

const MISSING_FORM_VALUE_ERROR = 'You must enter a value for either Name or NOMIS ID'

const subjectsQueryParametersSchema = z.object({
  queryId: z.string().optional(),
})

const subjectsFormDataSchema = z
  .object({
    name: z.string(),
    nomisId: z.string(),
  })
  .check(ctx => {
    if (Object.values(ctx.value).every(value => value === '' || value === undefined)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
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
