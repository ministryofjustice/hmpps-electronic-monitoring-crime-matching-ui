import { z } from 'zod/v4'

const positionSchema = z.object({
  positionId: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  precision: z.number(),
  speed: z.number(),
  direction: z.number(),
  timestamp: z.string(),
  geolocationMechanism: z.union([z.literal('GPS'), z.literal('RF'), z.literal('LBS'), z.literal('WIFI')]),
  sequenceNumber: z.number().default(0),
})

export default positionSchema
