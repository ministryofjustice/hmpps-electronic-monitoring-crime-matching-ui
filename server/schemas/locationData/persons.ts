import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'

const MISSING_FORM_VALUE_ERROR = 'You must enter a value for either Name or NOMIS ID'

const personsQueryParametersSchema = z.object({
  name: z.string().default(''),
  nomisId: z.string().default(''),
  page: z
    .string()
    .regex(/^\d{1,2}$/)
    .default('1'),
})

const personsFormDataSchema = z
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

const getPersonsQueryDtoSchema = paginatedDtoSchema.extend({
  data: z.array(
    z.object({
      personId: z.string(),
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
  ),
})

export { personsQueryParametersSchema, personsFormDataSchema, getPersonsQueryDtoSchema }
