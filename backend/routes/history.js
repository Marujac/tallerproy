import { NextResponse } from 'next/server';
import { getDb } from '@/backend/config/mongodb';
import { addUserHistory, getUserHistory } from '@/backend/services/demo-store';
import { getTokenFromRequest, verifyToken } from '@/backend/controllers/auth';

function isDemoMode() {
  const forceDemo = String(process.env.DEMO_AUTH || '').toLowerCase();
  const missingMongo = !process.env.MONGODB_URI || !process.env.MONGODB_DB;
  return forceDemo === '1' || forceDemo === 'true' || missingMongo;
}

export async function getHistoryRoute(request) {
  try {
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.sub || null;

    if (isDemoMode()) {
      const items = getUserHistory(userId || 'demo');
      return NextResponse.json(items);
    }

    const db = await getDb();
    const collection = db.collection('history');
    const query = userId ? { userId } : {};
    const docs = await collection.find(query).sort({ timestamp: -1 }).toArray();
    const history = docs.map((doc) => ({ id: doc._id.toString(), ...doc }));
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Ocurrió un error inesperado al obtener el historial.' }, { status: 500 });
  }
}

export async function createHistoryRoute(request) {
  try {
    const body = await request.json();
    const { text, fallacies, questions, score, timestamp } = body || {};
    if (!text || typeof score !== 'number' || !timestamp) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: text, score, timestamp.' },
        { status: 400 }
      );
    }

    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.sub || null;

    if (isDemoMode()) {
      const id = addUserHistory(userId || 'demo', {
        text,
        fallacies: fallacies || [],
        questions: questions || [],
        score,
        timestamp,
        userId,
      });
      return NextResponse.json({ id }, { status: 201 });
    }

    const db = await getDb();
    const collection = db.collection('history');
    const result = await collection.insertOne({
      text,
      fallacies: fallacies || [],
      questions: questions || [],
      score,
      timestamp,
      userId,
    });
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ error: 'Ocurrió un error inesperado al guardar el historial.' }, { status: 500 });
  }
}
