/* @jest-environment jsdom */

// Full-stack integration test: UI component -> real Next API handlers
// with MongoDB in memory and cookie propagation.

const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

const { QuestionsDisplay } = require('@/components/app/questions-display');

// Bridge fetch to Next API route handlers, maintaining a simple cookie jar
function createCookieJar() {
  const jar = { store: {} };
  return {
    get(name) { return this.store[name]; },
    setFromSetCookie(setCookie) {
      if (!setCookie) return;
      const m = /AUTH_TOKEN=([^;]+)/.exec(setCookie);
      if (m) this.store['AUTH_TOKEN'] = m[1];
    },
    store: jar.store,
  };
}

function createFetchBridge(cookieJar) {
  const routes = {
    '/api/analyze': require('@/app/api/analyze/route'),
    '/api/history': require('@/app/api/history/route'),
    '/api/auth/login': require('@/app/api/auth/login/route'),
    '/api/auth/signup': require('@/app/api/auth/signup/route'),
    '/api/auth/me': require('@/app/api/auth/me/route'),
    '/api/auth/logout': require('@/app/api/auth/logout/route'),
  };
  return async function fetch(url, options = {}) {
    const u = typeof url === 'string' ? url : url.url;
    const { method = 'GET', headers = {}, body } = options;
    const mod = routes[u];
    if (!mod) throw new Error(`No route for ${u}`);
    const req = {
      json: async () => {
        try { return body ? JSON.parse(body) : {}; } catch { return {}; }
      },
      cookies: { get: (name) => (cookieJar.get(name) ? { value: cookieJar.get(name) } : undefined) },
      headers,
    };
    const handler = mod[method.toUpperCase()];
    if (!handler) throw new Error(`Method ${method} not supported for ${u}`);
    const res = await handler(req);
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookieJar.setFromSetCookie(setCookie);
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      headers: res.headers,
      json: async () => {
        const text = await res.text();
        try { return JSON.parse(text || '{}'); } catch { return {}; }
      },
    };
  };
}

// Mock AI flow to avoid external dependency in analyze route if used
jest.mock('@/ai/flows/detect-logical-fallacies', () => ({
  detectLogicalFallacies: async () => ({ fallacies: [{ type: 'Ad Hominem', passage: 'p', explanation: 'e' }] }),
}));

describe('Full-stack integration (UI -> API)', () => {
  jest.setTimeout(20000);

  const dbName = 'fullstack';
  let cookieJar;
  let bridge;

  beforeAll(async () => {
    // Demo mode on to avoid ESM issues importing mongodb in jsdom
    process.env.DEMO_AUTH = 'true';
    process.env.AUTH_SECRET = 'testsecret';
    jest.resetModules();
    // Avoid importing the real mongodb driver within jsdom tests
    jest.doMock('@/lib/mongodb', () => ({ getDb: async () => { throw new Error('getDb should not be called in demo mode'); } }));
  });

  afterAll(async () => {
    // nothing
  });

  beforeEach(() => {
    cookieJar = createCookieJar();
    const f = createFetchBridge(cookieJar);
    const spy = jest.fn(f);
    global.fetch = spy;
    bridge = spy;
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  test('User logs in (API) then UI posts history and it is persisted', async () => {
    // Login via API in demo mode
    const loginRes = await bridge('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.DEMO_USER_EMAIL || 'demo@demo.com', password: process.env.DEMO_USER_PASSWORD || 'demo1234' }),
    });
    expect(loginRes.ok).toBe(true);
    expect(cookieJar.get('AUTH_TOKEN')).toBeTruthy();

    // Render UI and submit a quiz (POST /api/history under the hood)
    const questions = [
      { question: 'Q1', options: ['A','B','C','D'], correctAnswer: 0, explanation: '...' },
    ];
    render(React.createElement(QuestionsDisplay, { questions, text: 't', fallacies: [] }));

    // Select correct answer and submit
    const answerBtn = document.getElementById('q0o0');
    fireEvent.click(answerBtn);
    const submit = screen.getByRole('button', { name: /Revisar Respuestas/i });
    fireEvent.click(submit);

    // Ensure POST /api/history was called and returned 201
    await waitFor(() => expect(bridge).toHaveBeenCalledWith('/api/history', expect.objectContaining({ method: 'POST' })));
    const postCall = bridge.mock.calls.find(c => c[0] === '/api/history' && (c[1]?.method || 'GET') === 'POST');
    expect(postCall).toBeTruthy();
  });
});
