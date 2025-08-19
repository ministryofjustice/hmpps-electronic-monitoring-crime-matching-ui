import { PageElement } from '../../page'
import DateTimeInputComponent from '../dateTimeInputComponent'
import FormComponent from '../formComponent'

type SearchSubjectLocationsFormData = {
  fromDate?: Date | undefined
  toDate?: Date | undefined
}

export default class SearchSubjectLocationsFormComponent extends FormComponent {
  // FIELDS

  get searchFromHourField(): DateTimeInputComponent {
    const id = 'from-date-hour'
    return new DateTimeInputComponent(this.form, id)
  }

  get searchFromMinuteField(): DateTimeInputComponent {
    const id = 'from-date-minute'
    return new DateTimeInputComponent(this.form, id)
  }

  get searchFromSecondField(): DateTimeInputComponent {
    const id = 'from-date-second'
    return new DateTimeInputComponent(this.form, id)
  }

  get searchToHourField(): DateTimeInputComponent {
    const id = 'to-date-hour'
    return new DateTimeInputComponent(this.form, id)
  }

  get searchToMinuteField(): DateTimeInputComponent {
    const id = 'to-date-minute'
    return new DateTimeInputComponent(this.form, id)
  }

  get searchToSecondField(): DateTimeInputComponent {
    const id = 'to-date-second'
    return new DateTimeInputComponent(this.form, id)
  }

  get searchFromDateField(): DateTimeInputComponent {
    const id = 'from-date-date'
    return new DateTimeInputComponent(this.form, id)
  }

  get searchToDateField(): DateTimeInputComponent {
    const id = 'to-date-date'
    return new DateTimeInputComponent(this.form, id)
  }

  get continueButton(): PageElement {
    return this.form.contains('button', 'Continue')
  }

  // HELPERS

  fillInWith = (data: SearchSubjectLocationsFormData): undefined => {
    if (data.fromDate) {
      this.searchFromDateField.set(
        `${data.fromDate.getDate()}/${data.fromDate.getMonth() + 1}/${data.fromDate.getFullYear()}`,
      )
      this.searchFromHourField.set(data.fromDate.getHours())
      this.searchFromMinuteField.set(data.fromDate.getMinutes())
      this.searchFromSecondField.set(data.fromDate.getSeconds())
    }
    if (data.toDate) {
      this.searchToDateField.set(`${data.toDate.getDate()}/${data.toDate.getMonth() + 1}/${data.toDate.getFullYear()}`)
      this.searchToHourField.set(data.toDate.getHours())
      this.searchToMinuteField.set(data.toDate.getMinutes())
      this.searchToSecondField.set(data.toDate.getSeconds())
    }
  }
}
