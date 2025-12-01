#!/usr/bin/env bash
set -euo pipefail

echo "[tests-mongo] Waiting for Mongo at ${MONGODB_URI:-mongodb://mongo:27017} ..."

for i in {1..60}; do
  if node -e "const { MongoClient } = require('mongodb');
    (async () => { try { const c = new MongoClient(process.env.MONGODB_URI || 'mongodb://mongo:27017'); await c.connect(); await c.db(process.env.MONGODB_DB||'test').command({ ping: 1 }); await c.close(); process.exit(0);} catch(e){ process.exit(1);} })();"; then
    echo "[tests-mongo] Mongo is ready. Starting tests..."
    exec npm test -- --runInBand
  fi
  echo "[tests-mongo] Mongo not ready yet, retrying ($i/60) ..."
  sleep 1
done

echo "[tests-mongo] Timed out waiting for Mongo."
exit 1

