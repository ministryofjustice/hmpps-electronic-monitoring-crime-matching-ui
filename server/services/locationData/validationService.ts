import dayjs, { Dayjs } from 'dayjs'
import DeviceActivation from '../../types/entities/deviceActivation'
import { ValidationResult } from '../../models/ValidationResult'
import DeviceActivationsService from '../deviceActivationsService'
import { parseDateTimeFromISOString } from '../../utils/date'

const ERROR_INVALID_DATE = 'You must enter a valid value for date'
const ERROR_TO_BEFORE_FROM = 'To date must be after From date'
const ERROR_DATES_EXCEED_MAX_SEARCH_WINDOW = 'Date and time search window should not exceed 48 hours'
const ERROR_FROM_BEFORE_DEVICE_ACTIVATION = 'Update date to inside tag period'
const ERROR_TO_AFTER_DEVICE_DEACTIVATION = 'Update date to inside tag period'
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

    const deviceActivationDate = parseDateTimeFromISOString(deviceActivation.deviceActivationDate)
    const deviceDeactivationDate =
      deviceActivation.deviceDeactivationDate === null
        ? dayjs()
        : parseDateTimeFromISOString(deviceActivation.deviceDeactivationDate)

    if (from.isBefore(deviceActivationDate)) {
      errors.push({
        field: 'fromDate',
        message: ERROR_FROM_BEFORE_DEVICE_ACTIVATION,
      })
    }

    if (to.isAfter(deviceDeactivationDate)) {
      errors.push({
        field: 'toDate',
        message: ERROR_TO_AFTER_DEVICE_DEACTIVATION,
      })
    }

    return {
      success: errors.length === 0,
      errors,
    }
  }
}

export default ValidationService
