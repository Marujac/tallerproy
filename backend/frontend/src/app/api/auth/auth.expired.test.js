/* @jest-environment node */

import jwt from 'jsonwebtoken';

function makeGet(cookieMap = {}) {
  return {
    cookies: {
      get: (name) => (cookieMap[name] ? { value: cookieMap[name] } : undefined),
    },
  };
}

describe('GET /api/auth/me with expired token', () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = 'testsecret';
    process.env.DEMO_AUTH = 'false';
  });

  test('returns 401 when JWT is expired', async () => {
    const { GET } = require('@/app/api/auth/me/route');
    const secret = process.env.AUTH_SECRET;
    const expired = jwt.sign({ sub: 'u1', email: 'u@e.com', name: 'U' }, secret, { expiresIn: '-1s' });
    const res = await GET(makeGet({ AUTH_TOKEN: expired }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.user).toBeNull();
  });
});

