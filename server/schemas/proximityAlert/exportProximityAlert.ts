import { z } from 'zod/v4'

const deviceIdsSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value): string[] => {
    if (Array.isArray(value)) {
      return value.map(item => item.trim()).filter(Boolean)
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed ? [trimmed] : []
    }

    return []
  })

const exportProximityAlertFormSchema = z.object({
  deviceIds: deviceIdsSchema,
})

export default exportProximityAlertFormSchema
