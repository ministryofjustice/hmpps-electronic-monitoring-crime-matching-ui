import { z } from 'zod'

export const SubjectModel = z.object({
  nomisId: z.string(),
  name: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  address: z.string().nullable(),
  orderStartDate: z.string().nullable(),
  orderEndDate: z.string().nullable(),
  deviceId: z.string().nullable(),
  tagPeriodStartDate: z.string().nullable(),
  tagPeriodEndDate: z.string().nullable(),
})

export type Subject = z.infer<typeof SubjectModel>
