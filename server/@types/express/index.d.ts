import { HmppsUser } from '../../interfaces/hmppsUser'
import { ValidationResult } from '../../models/ValidationResult'
import DeviceActivation from '../../types/entities/deviceActivation'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    formData: unknown
    validationErrors: ValidationResult
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
    }

    interface Locals {
      user: HmppsUser
    }
  }
}
