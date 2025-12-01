const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:9002',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    downloadsFolder: 'cypress/downloads',
    videosFolder: 'cypress/videos',
    fixturesFolder: false,
    env: {
      adminKey: process.env.ADMIN_KEY || '',
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});
