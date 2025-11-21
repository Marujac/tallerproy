// Runs before every Cypress spec.
// You can add custom commands or shared hooks here.

// Example: simple helper to log current base URL
before(() => {
  cy.log(`E2E baseUrl: ${Cypress.config('baseUrl')}`);
});

// Ignore uncaught exceptions coming from the app (e.g. React 418)
Cypress.on('uncaught:exception', () => {
  return false;
});
