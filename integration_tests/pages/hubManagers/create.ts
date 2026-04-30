import AppPage from '../appPage'
import CreateHubManagerFormComponent from '../components/forms/createHubManagerForm'

export default class CreateHubManagerPage extends AppPage {
  constructor() {
    super('Create hub manager')
  }

  get createManagerForm(): CreateHubManagerFormComponent {
    return new CreateHubManagerFormComponent()
  }
}
