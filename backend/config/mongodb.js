// Cached MongoClient across hot reloads in development
let cachedClient = null;
let cachedDb = null;
let MongoClientCtor = null;

async function getMongoClientCtor() {
  if (!MongoClientCtor) {
    const mod = await import('mongodb');
    MongoClientCtor = mod.MongoClient;
  }
  return MongoClientCtor;
}

export async function getDb() {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }
  if (!dbName) {
    throw new Error('Missing MONGODB_DB environment variable');
  }

  const MongoClient = await getMongoClientCtor();
  const client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  return db;
}

