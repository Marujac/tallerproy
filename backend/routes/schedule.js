import { NextResponse } from 'next/server';
import { getDb } from '../config/mongodb';
import { getTokenFromRequest, verifyToken } from '../controllers/auth';

const DEFAULT_PREFERENCES = {
  times: ['08:00'],
  timezone: 'UTC',
  channels: {
    texts: true,
    reminders: true,
  },
};

const demoScheduleStore = {};

function isDemoMode() {
  const forceDemo = String(process.env.DEMO_AUTH || '').toLowerCase();
  const missingMongo = !process.env.MONGODB_URI || !process.env.MONGODB_DB;
  return forceDemo === '1' || forceDemo === 'true' || missingMongo;
}

function getUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.sub || null;
}

function normalizeTimezone(timezone) {
  if (!timezone || typeof timezone !== 'string') return DEFAULT_PREFERENCES.timezone;
  const cleaned = timezone.trim();
  if (!cleaned) return DEFAULT_PREFERENCES.timezone;
  return cleaned.slice(0, 120);
}

function validateTimes(times) {
  if (!Array.isArray(times) || times.length === 0) {
    return { ok: false, error: 'Agrega al menos un horario en formato HH:MM.' };
  }
  if (times.length > 12) {
    return { ok: false, error: 'Limita los horarios a 12 para evitar envios excesivos.' };
  }

  const matcher = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const unique = new Set();

  for (const value of times) {
    if (typeof value !== 'string' || !matcher.test(value)) {
      return { ok: false, error: 'Formato de horario invalido. Usa HH:MM en 24 horas.' };
    }
    unique.add(value);
  }

  const normalized = Array.from(unique).sort();
  return { ok: true, times: normalized };
}

function buildResponsePayload(doc = {}) {
  return {
    times: doc.times && Array.isArray(doc.times) && doc.times.length ? doc.times : DEFAULT_PREFERENCES.times,
    timezone: doc.timezone || DEFAULT_PREFERENCES.timezone,
    channels: {
      ...DEFAULT_PREFERENCES.channels,
      ...(doc.channels || {}),
    },
    updatedAt: doc.updatedAt || null,
  };
}

export async function getScheduleRoute(request) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

    if (isDemoMode()) {
      const prefs = buildResponsePayload(demoScheduleStore[userId]);
      return NextResponse.json(prefs);
    }

    const db = await getDb();
    const doc = await db.collection('schedule_preferences').findOne({ userId });
    const prefs = buildResponsePayload(doc || {});
    return NextResponse.json(prefs);
  } catch (error) {
    console.error('Error getting schedule preferences:', error);
    return NextResponse.json({ error: 'No se pudieron obtener tus horarios.' }, { status: 500 });
  }
}

export async function saveScheduleRoute(request) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

    const body = await request.json();
    const validation = validateTimes(body?.times);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const payload = {
      userId,
      times: validation.times,
      timezone: normalizeTimezone(body?.timezone),
      channels: {
        texts: body?.channels?.texts !== false,
        reminders: body?.channels?.reminders !== false,
      },
      updatedAt: Date.now(),
    };

    if (isDemoMode()) {
      demoScheduleStore[userId] = payload;
      return NextResponse.json(payload, { status: 201 });
    }

    const db = await getDb();
    await db.collection('schedule_preferences').updateOne(
      { userId },
      { $set: payload },
      { upsert: true }
    );
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error('Error saving schedule preferences:', error);
    return NextResponse.json({ error: 'No se pudo guardar el horario.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
