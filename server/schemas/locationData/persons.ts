import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'

const MISSING_FORM_VALUE_ERROR = 'You must enter a value for Name, NOMIS ID or Device ID'

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

export { personsQueryParametersSchema, personsFormDataSchema }
