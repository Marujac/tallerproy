describe('Auth pages', () => {
  it('redirects to login when visiting root without session', () => {
    cy.visit('/');
    cy.location('pathname', { timeout: 10000 }).should('eq', '/login');
  });

  it('shows validation error for short text on analyze API', () => {
    cy.request({
      method: 'POST',
      url: '/api/analyze',
      failOnStatusCode: false,
      body: { text: 'muy corto' },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.match(/50 caracteres/i);
    });
  });
});

