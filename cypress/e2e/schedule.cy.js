describe('Schedule API', () => {
  function ensureUser() {
    const email = `schedule_${Date.now()}@example.com`;
    const password = 'secret999';
    return cy.request({
      method: 'POST',
      url: '/api/auth/signup',
      body: { name: 'Schedule User', email, password },
    }).then(() => ({ email, password }));
  }

  it('requires auth to read schedule', () => {
    cy.request({
      method: 'GET',
      url: '/api/schedule',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.match(/no autorizado/i);
    });
  });

  it('returns default preferences after logging in', () => {
    ensureUser().then(({ email, password }) => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email, password },
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);
        cy.getCookie('AUTH_TOKEN').should('exist');
      });
    }).then(() => {
      cy.request('/api/schedule').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.times).to.be.an('array').and.not.to.be.empty;
        expect(response.body.timezone).to.be.a('string');
        expect(response.body.channels).to.have.property('texts', true);
      });
    });
  });

  it('validates schedule time format', () => {
    ensureUser().then(({ email, password }) => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email, password },
      });
    }).then(() => {
      cy.request({
        method: 'PUT',
        url: '/api/schedule',
        failOnStatusCode: false,
        body: { times: ['99:99'] },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.match(/formato/i);
      });
    });
  });

  it('saves schedule preferences for the logged in user', () => {
    const payload = {
      times: ['07:30', '19:00'],
      timezone: 'America/Bogota',
      channels: { texts: true, reminders: false },
    };

    ensureUser().then(({ email, password }) => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email, password },
      });
    }).then(() => {
      cy.request({
        method: 'PUT',
        url: '/api/schedule',
        body: payload,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.times).to.deep.equal(['07:30', '19:00']);
        expect(response.body.channels.reminders).to.eq(false);
      });
    });
  });
});
