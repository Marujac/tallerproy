describe('Auth pages', () => {
  it('redirects to login when visiting root without session', () => {
    cy.clearCookie('AUTH_TOKEN');
    cy.visit('/');
    cy.location('pathname', { timeout: 10000 }).then((pathname) => {
      if (!/\/login/.test(pathname)) {
        cy.visit('/login?next=/');
      }
    });
    cy.contains(/Iniciar Sesi/i, { timeout: 15000 }).should('exist');
    cy.location('pathname', { timeout: 5000 }).should('include', '/login');
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

  it('returns null user when not authenticated', () => {
    cy.clearCookie('AUTH_TOKEN');
    cy.request('/api/auth/me').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user).to.be.null;
    });
  });

  it('rejects signup when password is too short', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/signup',
      failOnStatusCode: false,
      body: { name: 'Test User', email: 'demo@demo.com', password: '123' },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.match(/email/i);
    });
  });

  it('returns unauthorized on invalid login credentials', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      failOnStatusCode: false,
      body: { email: 'wrong@user.com', password: 'wrong-pass' },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.match(/credenciales/i);
    });
  });

  it('creates a user, logs in, and keeps session for /api/auth/me', () => {
    const email = `cypress_${Date.now()}@example.com`;
    const password = 'secret123';

    cy.request({
      method: 'POST',
      url: '/api/auth/signup',
      body: { name: 'Cypress User', email, password },
    }).then((signupResponse) => {
      expect([200, 201, 409]).to.include(signupResponse.status);
    }).then(() => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email, password },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.have.property('email', email);
        cy.getCookie('AUTH_TOKEN').should('exist');
      });
    }).then(() => {
      cy.request('/api/auth/me').then((meResponse) => {
        expect(meResponse.status).to.eq(200);
        expect(meResponse.body.user.email).to.eq(email);
      });
    });
  });

  it('logs out and clears the session for /api/auth/me', () => {
    const email = `cypress_logout_${Date.now()}@example.com`;
    const password = 'secret456';

    cy.request({
      method: 'POST',
      url: '/api/auth/signup',
      body: { name: 'Logout User', email, password },
    }).then(() => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email, password },
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);
        cy.getCookie('AUTH_TOKEN').should('exist');
      });
    }).then(() => {
      cy.request({ method: 'POST', url: '/api/auth/logout' }).then((logoutResponse) => {
        expect(logoutResponse.status).to.eq(200);
        cy.getCookie('AUTH_TOKEN').should('not.exist');
      });
    }).then(() => {
      cy.request('/api/auth/me').then((meResponse) => {
        expect(meResponse.status).to.eq(200);
        expect(meResponse.body.user).to.be.null;
      });
    });
  });
});

