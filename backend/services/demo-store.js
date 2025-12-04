// Simple in-memory store for demo mode. Resets on server restart.
let store = {};

export function getUserHistory(userId) {
  const key = userId || 'anonymous';
  return store[key] || [];
}

export function addUserHistory(userId, item) {
  const key = userId || 'anonymous';
  if (!store[key]) store[key] = [];
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const doc = { id, ...item };
  store[key].unshift(doc);
  return id;
}

