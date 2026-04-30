import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormFileUploadComponent, { UploadFileOptions } from '../formFileUploadComponent'
import FormInputComponent from '../formInputComponent'

type CreateHubManagerFormData = {
  name?: string
  signature?: UploadFileOptions
}

export default class CreateHubManagerFormComponent extends FormComponent {
  constructor() {
    super('create-hub-managers-form')
  }

  // FIELDS

  get nameField(): FormInputComponent {
    return new FormInputComponent(this.form, 'What is the name of the hub manager?')
  }

  get signatureField(): FormFileUploadComponent {
    return new FormFileUploadComponent(this.form, 'Upload a signature')
  }

  get createButton(): PageElement<HTMLButtonElement> {
    return this.form.contains('button', 'Create')
  }

  // HELPERS

  fillInWith(data: CreateHubManagerFormData) {
    if (data.name) {
      this.nameField.set(data.name)
    }

    if (data.signature) {
      this.signatureField.uploadFile(data.signature)
    }
  }
}
