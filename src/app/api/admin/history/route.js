import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function GET(request) {
  try {
    const requiredKey = process.env.ADMIN_KEY || '';
    const headerKey = request.headers.get('x-admin-key') || '';
    if (!requiredKey || headerKey !== requiredKey) {
      return unauthorized('Falta o es inválida la clave administrativa.');
    }

    const url = new URL(request.url);
    let userId = (url.searchParams.get('userId') || '').trim();
    const email = (url.searchParams.get('email') || '').toLowerCase().trim();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    const skip = Math.max(parseInt(url.searchParams.get('skip') || '0', 10), 0);

    const db = await getDb();

    // Resolve userId by email if needed
    if (!userId && email) {
      const user = await db.collection('users').findOne({ email });
      if (user && user._id) userId = user._id.toString();
    }

    const query = userId ? { userId } : {};
    const cursor = db
      .collection('history')
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const docs = await cursor.toArray();
    const items = docs.map((h) => ({ id: h._id?.toString?.() || h.id, ...h }));
    return NextResponse.json({ items, count: items.length });
  } catch (e) {
    console.error('Admin history GET error', e);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

