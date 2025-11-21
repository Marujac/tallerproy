import { createHistoryRoute, getHistoryRoute } from '@/backend/routes/history';

export async function GET(request) {
  return getHistoryRoute(request);
}

export async function POST(request) {
  return createHistoryRoute(request);
}
