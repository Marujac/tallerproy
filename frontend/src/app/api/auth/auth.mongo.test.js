/* @jest-environment node */

// Tests for Auth API routes using mongodb-memory-server (real Mongo in RAM).

let MongoMemoryServer;
try {
  ({ MongoMemoryServer } = require('mongodb-memory-server'));
} catch (_) {}

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

function makePost(body, cookieMap = {}) {
  return {
    json: async () => body,
    cookies: {
      get: (name) => (cookieMap[name] ? { value: cookieMap[name] } : undefined),
    },
  };
}

function makeGet(cookieMap = {}) {
  return {
    cookies: {
      get: (name) => (cookieMap[name] ? { value: cookieMap[name] } : undefined),
    },
  };
}

describe('Auth API with MongoDB in-memory', () => {
  if (!MongoMemoryServer) {
    test.skip('mongodb-memory-server not available; skipping', () => {});
    return;
  }

  jest.setTimeout(30000);

  let mms;
  let client;
  const dbName = 'authtest';

  beforeAll(async () => {
    mms = await MongoMemoryServer.create();
    const uri = mms.getUri();
    client = new MongoClient(uri, { ignoreUndefined: true });
    await client.connect();

    process.env.MONGODB_URI = uri;
    process.env.MONGODB_DB = dbName;
    process.env.DEMO_AUTH = 'false';
    process.env.AUTH_SECRET = 'testsecret';

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
    await db.collection('users').deleteMany({});
  });

  test('POST /api/auth/signup creates user and sets cookie', async () => {
    const { POST } = require('@/app/api/auth/signup/route');

    const req = makePost({ name: 'Ana', email: 'ana@example.com', password: 'secret123' });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toBe('ana@example.com');
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toMatch(/AUTH_TOKEN=/);
  });

  test('POST /api/auth/signup rejects duplicate email', async () => {
    const db = client.db(dbName);
    await db.collection('users').insertOne({ name: 'Ana', email: 'ana@example.com', passwordHash: 'x' });

    const { POST } = require('@/app/api/auth/signup/route');
    const res = await POST(makePost({ name: 'Ana', email: 'ana@example.com', password: 'secret123' }));
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login logs in and sets cookie', async () => {
    const db = client.db(dbName);
    const passwordHash = await bcrypt.hash('secret123', 10);
    await db.collection('users').insertOne({ name: 'Ana', email: 'ana@example.com', passwordHash, createdAt: Date.now() });

    const { POST } = require('@/app/api/auth/login/route');
    const res = await POST(makePost({ email: 'ana@example.com', password: 'secret123' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe('ana@example.com');
    expect(res.headers.get('set-cookie')).toMatch(/AUTH_TOKEN=/);
  });

  test('POST /api/auth/login fails with wrong password', async () => {
    const db = client.db(dbName);
    const passwordHash = await bcrypt.hash('secret123', 10);
    await db.collection('users').insertOne({ name: 'Ana', email: 'ana@example.com', passwordHash, createdAt: Date.now() });

    const { POST } = require('@/app/api/auth/login/route');
    const res = await POST(makePost({ email: 'ana@example.com', password: 'bad' }));
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns user when cookie valid', async () => {
    const { signToken } = require('@/lib/auth');
    const token = signToken({ sub: 'u1', email: 'u@e.com', name: 'U' });
    const { GET } = require('@/app/api/auth/me/route');
    const res = await GET(makeGet({ AUTH_TOKEN: token }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe('u@e.com');
  });

  test('GET /api/auth/me returns null when no cookie', async () => {
    const { GET } = require('@/app/api/auth/me/route');
    const res = await GET(makeGet());
    const data = await res.json();
    expect(data.user).toBeNull();
  });
});

