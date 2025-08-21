import { Dayjs } from 'dayjs'
import DeviceActivation from '../../types/entities/deviceActivation'
import { ValidationResult } from '../../models/ValidationResult'
import DeviceActivationsService from '../deviceActivationsService'

const ERROR_INVALID_DATE = 'You must enter a valid value for date'
const ERROR_TO_BEFORE_FROM = 'To date must be after From date'
const ERROR_DATES_EXCEED_DEVICE_ACTIVATION = 'Date and time search window should be within device activation date range'
const ERROR_DATES_EXCEED_MAX_SEARCH_WINDOW = 'Date and time search window should not exceed 48 hours'
const MAX_SEARCH_WINDOW = 48 * 60 * 60 * 1000

class ValidationService {
  constructor(private readonly deviceActivationsService: DeviceActivationsService) {}

  validateDeviceActivationPositionsRequest = (deviceActivation: DeviceActivation, from: Dayjs, to: Dayjs) => {
    const errors: ValidationResult = []

    if (!from.isValid()) {
      errors.push({
        field: 'fromDate',
        message: ERROR_INVALID_DATE,
      })
    }

    if (!to.isValid()) {
      errors.push({
        field: 'toDate',
        message: ERROR_INVALID_DATE,
      })
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      }
    }

    if (to.isSameOrBefore(from)) {
      return {
        success: false,
        errors: [
          {
            field: 'toDate',
            message: ERROR_TO_BEFORE_FROM,
          },
        ],
      }
    }

    if (to.valueOf() - from.valueOf() > MAX_SEARCH_WINDOW) {
      return {
        success: false,
        errors: [
          {
            field: 'fromDate',
            message: ERROR_DATES_EXCEED_MAX_SEARCH_WINDOW,
          },
        ],
      }
    }

    if (!this.deviceActivationsService.isDateRangeWithinDeviceActivation(deviceActivation, from, to)) {
      return {
        success: false,
        errors: [
          {
            field: 'fromDate',
            message: ERROR_DATES_EXCEED_DEVICE_ACTIVATION,
          },
        ],
      }
    }

    return {
      success: true,
      errors: [],
    }
  }
}

export default ValidationService
