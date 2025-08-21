import { z } from 'zod/v4'

const positionSchema = z.object({
  locationRef: z.number(),
  point: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  confidenceCircle: z.number(),
  speed: z.number(),
  direction: z.number(),
  timestamp: z.string(),
  geolocationMechanism: z.number(),
  sequenceNumber: z.number(),
})

export default positionSchema
