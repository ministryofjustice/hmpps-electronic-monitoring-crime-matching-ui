import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import crimeMatching from './integration_tests/mockApis/crimeMatching'
import map from './integration_tests/mockApis/map'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  viewportWidth: 1920,
  e2e: {
    env: {
      visualRegressionType: 'regression',
    },
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...crimeMatching,
        ...map,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
