/* @jest-environment node */

// Backend tests using a real MongoDB in memory when available.
// Falls back to skipping if mongodb-memory-server isn't installed/accessible.

const path = require('path');

let MongoMemoryServer;
try {
  // Optional dependency; skip if not present
  ({ MongoMemoryServer } = require('mongodb-memory-server'));
} catch (_) {
  // leave undefined
}

const { MongoClient } = require('mongodb');

// Helpers to fabricate Next.js-like Request objects for our route handlers
function makeRequestJson(body, cookieMap = {}) {
  return {
    json: async () => body,
    cookies: {
      get: (name) => (cookieMap[name] ? { value: cookieMap[name] } : undefined),
    },
  };
}

function makeRequestCookies(cookieMap = {}) {
  return {
    cookies: {
      get: (name) => (cookieMap[name] ? { value: cookieMap[name] } : undefined),
    },
  };
}

describe('API /api/history with mongodb-memory-server', () => {
  if (!MongoMemoryServer) {
    test.skip('mongodb-memory-server not available; skipping', () => {});
    return;
  }

  jest.setTimeout(30000);

  let mms;
  let client;
  let dbName = 'testdb';

  beforeAll(async () => {
    mms = await MongoMemoryServer.create();
    const uri = mms.getUri();
    client = new MongoClient(uri, { ignoreUndefined: true });
    await client.connect();

    // Ensure DB envs are set and demo mode disabled
    process.env.MONGODB_URI = uri;
    process.env.MONGODB_DB = dbName;
    process.env.DEMO_AUTH = 'false';
    process.env.AUTH_SECRET = 'testsecret';

    // Rewire getDb to use our connected client
    jest.resetModules();
    jest.doMock('@/lib/mongodb', () => ({
      getDb: async () => client.db(dbName),
    }));
  });

  afterAll(async () => {
    try { await client?.close(); } catch {}
    try { await mms?.stop(); } catch {}
    jest.dontMock('@/lib/mongodb');
  });

  afterEach(async () => {
    const db = client.db(dbName);
    await db.collection('history').deleteMany({});
    await db.collection('users').deleteMany({});
  });

  test('POST creates history item and GET returns it', async () => {
    const { POST, GET } = require('@/app/api/history/route');

    const now = Date.now();
    const req = makeRequestJson({
      text: 'example',
      fallacies: [],
      questions: [],
      score: 90,
      timestamp: now,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('id');

    const resGet = await GET(makeRequestCookies());
    expect(resGet.status).toBe(200);
    const list = await resGet.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(1);
    expect(list[0].score).toBe(90);
    expect(list[0].timestamp).toBe(now);
  });

  test('POST associates userId when AUTH_TOKEN cookie is present', async () => {
    const { POST, GET } = require('@/app/api/history/route');
    const { signToken } = require('@/lib/auth');

    const token = signToken({ sub: 'user123', email: 'u@e.com', name: 'U' });

    const req = makeRequestJson({ text: 't', score: 50, timestamp: Date.now() }, { AUTH_TOKEN: token });
    const res = await POST(req);
    expect(res.status).toBe(201);

    const resGet = await GET(makeRequestCookies({ AUTH_TOKEN: token }));
    const items = await resGet.json();
    expect(items[0].userId).toBe('user123');
  });
});

