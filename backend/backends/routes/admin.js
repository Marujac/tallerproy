import { NextResponse } from 'next/server';
import { getDb } from '../config/mongodb';

function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function hasValidAdminKey(request) {
  const requiredKey = process.env.ADMIN_KEY || '';
  const headerKey = request.headers.get('x-admin-key') || '';
  return requiredKey && headerKey === requiredKey;
}

export async function adminHistoryRoute(request) {
  try {
    if (!hasValidAdminKey(request)) {
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

export async function adminUsersRoute(request) {
  try {
    if (!hasValidAdminKey(request)) {
      return unauthorized('Falta o es inválida la clave administrativa.');
    }

    const url = new URL(request.url);
    const email = (url.searchParams.get('email') || '').toLowerCase().trim();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    const skip = Math.max(parseInt(url.searchParams.get('skip') || '0', 10), 0);

    const db = await getDb();
    const collection = db.collection('users');
    const query = email ? { email } : {};

    const cursor = collection
      .find(query, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const docs = await cursor.toArray();

    const items = docs.map((u) => ({
      id: (u._id?.toString && u._id.toString()) || u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ items, count: items.length });
  } catch (e) {
    console.error('Admin users GET error', e);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}

export async function adminRemindersRoute(request) {
  try {
    if (!hasValidAdminKey(request)) {
      return unauthorized('Falta o es invǭlida la clave administrativa.');
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '200', 10), 500);
    const skip = Math.max(parseInt(url.searchParams.get('skip') || '0', 10), 0);
    const channel = (url.searchParams.get('channel') || 'reminders').toLowerCase();

    const db = await getDb();
    const match = {};
    if (channel === 'reminders') {
      match['channels.reminders'] = { $ne: false };
    }

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          userObjectId: {
            $convert: { input: '$userId', to: 'objectId', onError: null, onNull: null },
          },
        },
      },
      { $match: { userObjectId: { $ne: null } } },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$userId',
          email: '$user.email',
          name: '$user.name',
          times: '$times',
          timezone: '$timezone',
          channels: '$channels',
          updatedAt: '$updatedAt',
        },
      },
    ];

    const docs = await db.collection('schedule_preferences').aggregate(pipeline).toArray();
    const items = docs
      .filter((doc) => doc.email)
      .map((doc) => ({
        ...doc,
        userId: (doc.userId?.toString && doc.userId.toString()) || doc.userId,
        times: Array.isArray(doc.times) && doc.times.length ? doc.times : ['08:00'],
        timezone: doc.timezone || 'UTC',
      }));

    return NextResponse.json({ items, count: items.length });
  } catch (e) {
    console.error('Admin reminders GET error', e);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
