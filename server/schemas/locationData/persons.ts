import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'

const MISSING_FORM_VALUE_ERROR = 'You must enter a value for Name, NOMIS ID or Device ID'

const personsQueryParametersSchema = z.object({
  name: z.string().default(''),
  nomisId: z.string().default(''),
  deviceId: z.string().default(''),

  page: z
    .string()
    .regex(/^\d{1,2}$/)
    .default('1'),
})

const personsFormDataSchema = z
  .object({
    name: z.string(),
    nomisId: z.string(),
    deviceId: z.string(),
    personSearchType: z.enum(['name', 'nomisId', 'deviceId']),
  })
  .refine(
    data => {
      const selectedValue = data[data.personSearchType]
      return selectedValue && selectedValue.trim() !== ''
    },
    {
      message: MISSING_FORM_VALUE_ERROR,
      path: ['personSearchType'],
    },
  )

const getpersonsQueryDtoSchema = paginatedDtoSchema.extend({
  data: z.array(
    z.object({
      personId: z.string(),
      nomisId: z.string(),
      name: z.string(),
      dateOfBirth: z.string(),
      address: z.string(),
      deviceId: z.string(),
      tagPeriodStartDate: z.string(),
      tagPeriodEndDate: z.string().nullable(),
    }),
  ),
})

export { personsQueryParametersSchema, personsFormDataSchema, getpersonsQueryDtoSchema }
