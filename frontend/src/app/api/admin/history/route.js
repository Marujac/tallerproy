import { adminHistoryRoute, dynamic } from '@/backend/routes/admin';

export async function GET(request) {
  return adminHistoryRoute(request);
}

export { dynamic };
