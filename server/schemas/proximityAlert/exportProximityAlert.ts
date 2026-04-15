import { z } from 'zod/v4'

const capturedMapStateValueSchema = z.object({
  mapWidthPx: z.number(),
  mapHeightPx: z.number(),
  devicePixelRatio: z.number(),
  view: z.object({
    center: z.tuple([z.number(), z.number()]),
    resolution: z.number(),
    rotation: z.number(),
  }),
})

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

const capturedMapStateSchema = z
  .string()
  .optional()
  .transform(value => {
    if (typeof value !== 'string') return undefined

    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  })
  .check(ctx => {
    if (!ctx.value) return

    try {
      const parsed = JSON.parse(ctx.value)
      const result = capturedMapStateValueSchema.safeParse(parsed)

      if (!result.success) {
        ctx.issues.push({
          code: 'custom',
          input: ctx.value,
          message: 'Captured map state is not in a valid format',
          path: ['capturedMapState'],
        })
      }
    } catch {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: 'Captured map state must be valid JSON',
        path: ['capturedMapState'],
      })
    }
  })

const exportProximityAlertFormSchema = z.object({
  deviceIds: deviceIdsSchema,
  capturedMapState: capturedMapStateSchema,
})

export default exportProximityAlertFormSchema
