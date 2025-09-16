import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'

const MISSING_FORM_VALUE_ERROR = 'You must enter a value for either Name, NOMIS ID or Device ID'

const personsQueryParametersSchema = z.object({
  searchTerm: z.string().default(''),
  searchField: z.enum(['name', 'nomisId', 'deviceId']).optional(),
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
    searchField: z.enum(['name', 'nomisId', 'deviceId']).optional(),
  })
  .check(ctx => {
    if (
      [ctx.value.name, ctx.value.nomisId, ctx.value.deviceId].every(
        value => value.trim() === '' || value === undefined,
      ) ||
      ctx.value.searchField === undefined
    ) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: MISSING_FORM_VALUE_ERROR,
        path: ['searchField'],
      })
    }
  })
  .transform(data => {
    const { searchField } = data
    let searchTerm = ''
    if (searchField === 'name') {
      searchTerm = data.name
    } else if (searchField === 'nomisId') {
      searchTerm = data.nomisId
    } else if (searchField === 'deviceId') {
      searchTerm = data.deviceId
    }

    return {
      searchField,
      searchTerm,
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
