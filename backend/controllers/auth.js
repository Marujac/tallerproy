import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from '@/backend/config/mongodb';

const COOKIE_NAME = 'AUTH_TOKEN';

export function getJwtSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('Missing AUTH_SECRET env var');
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

// Test-only/utility: check if a token is specifically expired
export function isTokenExpired(token) {
  try {
    jwt.verify(token, getJwtSecret());
    return false;
  } catch (e) {
    return e && e.name === 'TokenExpiredError';
  }
}

export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res) {
  res.cookies.set({ name: COOKIE_NAME, value: '', path: '/', maxAge: 0 });
}

export function getTokenFromRequest(request) {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

// Demo mode support (before MongoDB connection)
function isDemoMode() {
  const forceDemo = String(process.env.DEMO_AUTH || '').toLowerCase();
  const missingMongo = !process.env.MONGODB_URI || !process.env.MONGODB_DB;
  return forceDemo === '1' || forceDemo === 'true' || missingMongo;
}

function getDemoUser() {
  const email = process.env.DEMO_USER_EMAIL || 'demo@demo.com';
  const name = process.env.DEMO_USER_NAME || 'Demo User';
  const id = 'demo';
  return { id, name, email };
}

export async function findUserByEmail(email) {
  if (isDemoMode()) {
    const demoEmail = (process.env.DEMO_USER_EMAIL || 'demo@demo.com').toLowerCase();
    if (email.toLowerCase() === demoEmail) return { ...getDemoUser(), passwordHash: null };
    return null;
  }
  const db = await getDb();
  return db.collection('users').findOne({ email: email.toLowerCase() });
}

export async function createUser({ name, email, password }) {
  if (isDemoMode()) {
    // In demo mode, only allow the configured demo user
    const demoEmail = (process.env.DEMO_USER_EMAIL || 'demo@demo.com').toLowerCase();
    if (email.toLowerCase() !== demoEmail) {
      return null;
    }
    return getDemoUser();
  }
  const db = await getDb();
  const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (existing) return null;
  const passwordHash = await bcrypt.hash(password, 10);
  const doc = {
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: Date.now(),
  };
  const result = await db.collection('users').insertOne(doc);
  return { id: result.insertedId.toString(), ...doc };
}

export async function validateCredentials(email, password) {
  if (isDemoMode()) {
    const demoEmail = (process.env.DEMO_USER_EMAIL || 'demo@demo.com').toLowerCase();
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'demo1234';
    if (email.toLowerCase() === demoEmail && password === demoPassword) {
      return getDemoUser();
    }
    return null;
  }
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return null;
  return { id: (user._id?.toString && user._id.toString()) || user.id, name: user.name, email: user.email };
}

