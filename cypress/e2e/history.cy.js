describe('History API', () => {
  it('returns an array for GET /api/history', () => {
    cy.request('/api/history').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('rejects creating history with missing required fields', () => {
    cy.request({
      method: 'POST',
      url: '/api/history',
      failOnStatusCode: false,
      body: {},
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.match(/faltan campos/i);
    });
  });

  it('saves a history record and returns it in subsequent GET', () => {
    const email = `history_${Date.now()}@example.com`;
    const password = 'secret789';

    cy.request({
      method: 'POST',
      url: '/api/auth/signup',
      body: { name: 'History User', email, password },
    });

    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email, password },
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);
      cy.getCookie('AUTH_TOKEN').should('exist');
    });

    const payload = {
      text: 'Texto de prueba para historial con mas de cincuenta caracteres para que sea valido.',
      fallacies: [],
      questions: [],
      score: 85,
      timestamp: Date.now(),
    };

    cy.request({
      method: 'POST',
      url: '/api/history',
      body: payload,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      return cy.request('/api/history');
    }).then((getResponse) => {
      expect(getResponse.status).to.eq(200);
      const [first] = getResponse.body;
      expect(first.text).to.include('Texto de prueba');
      expect(first.score).to.eq(85);
    });
  });
});
