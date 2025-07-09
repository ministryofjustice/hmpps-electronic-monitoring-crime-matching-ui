import { configureVisualRegression } from 'cypress-visual-regression'
import configureScreenshotResolution from './configureScreenshotResolution'
import { resetStubs } from '../mockApis/wiremock'
import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import crimeMatching from '../mockApis/crimeMatching'

const setupNodeEvents = (on: Cypress.PluginEvents): void => {
  configureScreenshotResolution(on)
  configureVisualRegression(on)

  on('task', {
    reset: resetStubs,
    ...auth,
    ...tokenVerification,
    ...crimeMatching,
  })
}

export default setupNodeEvents
