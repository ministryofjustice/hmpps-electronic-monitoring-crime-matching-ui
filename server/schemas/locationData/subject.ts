import { z } from 'zod/v4'
import DateTimeInputModel from '../formInput/dateTime'

const viewLocationsQueryParametersSchema = z.object({
  from: z.string().default(''),
  to: z.string().default(''),
})

const downloadLocationsQueryParameterSchema = viewLocationsQueryParametersSchema.extend({
  reportType: z.enum(['condensed', 'full']).default('condensed'),
})

const searchLocationsFormDataSchema = z
  .object({
    fromDate: DateTimeInputModel,
    toDate: DateTimeInputModel,
  })
  .transform(data => {
    return {
      fromDate: data.fromDate.toISOString(),
      toDate: data.toDate.toISOString(),
    }
  })

export { downloadLocationsQueryParameterSchema, searchLocationsFormDataSchema, viewLocationsQueryParametersSchema }
