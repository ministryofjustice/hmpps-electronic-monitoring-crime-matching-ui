import { MojAlert, MojAlertVariant } from '../types/govUk/mojAlert'

const createMojAlert = (variant: MojAlertVariant, title: string, text: string): MojAlert => ({
  variant,
  title,
  text,
  showTitleAsHeading: true,
  dismissible: false,
})

const createMojAlertError = (title: string, text: string) => createMojAlert('error', title, text)

const createMojAlertInformation = (title: string, text: string) => createMojAlert('information', title, text)

const createMojAlertSuccess = (title: string, text: string) => createMojAlert('success', title, text)

const createMojAlertWarning = (title: string, text: string) => createMojAlert('warning', title, text)

export { createMojAlert, createMojAlertError, createMojAlertInformation, createMojAlertSuccess, createMojAlertWarning }
