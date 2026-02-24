import { z } from 'zod/v4'

const policeDataDashboardQuerySchema = z.object({
  policeForceArea: z.string().default(''),
  batchId: z.string().default(''),
  fromDate: z.string().default(''),
  toDate: z.string().default(''),
})

export default policeDataDashboardQuerySchema
