import { HmppsUser } from '../../interfaces/hmppsUser'
import { ValidationResult } from '../../models/ValidationResult'
import DeviceActivation from '../../types/entities/deviceActivation'
import type { ExportProximityAlertState } from '../form-pages/proximityAlert/exportProximityAlert'

type RateLimitInfo = {
  limit: number
  used: number
  remaining: number
  resetTime?: Date
  key: string
}

export declare module 'express-session' {
  interface SessionData {
    returnTo: string
    formData: unknown
    validationErrors: ValidationResult
    exportProximityAlertState?: ExportProximityAlertState
    queryId: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
      deviceActivation?: DeviceActivation
      rateLimit?: RateLimitInfo
    }

    interface Locals {
      user: HmppsUser
    }
  }
}
