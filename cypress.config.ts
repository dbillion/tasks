import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '2f9491',
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  e2e: {
    setupNodeEvents(on, config) {},
    supportFile: 'cypress/support/e2e.ts',
    baseUrl: 'http://localhost:5173'
  },
  video: false,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/reports/output.xml'
  }
})