import { z } from 'zod/v4'

export const capturedMapStateValueSchema = z.object({
  mapWidthPx: z.number(),
  mapHeightPx: z.number(),
  devicePixelRatio: z.number(),
  view: z.object({
    center: z.tuple([z.number(), z.number()]),
    resolution: z.number(),
    rotation: z.number(),
  }),
})

export type CapturedMapStateValue = z.infer<typeof capturedMapStateValueSchema>

export const formStringArraySchema = z
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

export const optionalTrimmedStringSchema = z
  .string()
  .optional()
  .transform(value => {
    if (typeof value !== 'string') return undefined

    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  })

const capturedMapStateSchema = optionalTrimmedStringSchema.check(ctx => {
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
  deviceIds: formStringArraySchema,
  capturedMapState: capturedMapStateSchema,
})

export default exportProximityAlertFormSchema
