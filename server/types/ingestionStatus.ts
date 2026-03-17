import { z } from 'zod/v4'

const ingestionStatusSchema = z.enum(['SUCCESSFUL', 'PARTIAL', 'FAILED', 'ERROR', 'UNKNOWN'])

type IngestionStatus = z.infer<typeof ingestionStatusSchema>

export { ingestionStatusSchema }
export type { IngestionStatus }
