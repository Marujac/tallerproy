import { adminRemindersRoute, dynamic } from '@/backend/routes/admin';

export async function GET(request) {
  return adminRemindersRoute(request);
}

export { dynamic };
