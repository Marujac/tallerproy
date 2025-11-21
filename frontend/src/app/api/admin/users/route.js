import { adminUsersRoute, dynamic } from '@/backend/routes/admin';

export async function GET(request) {
  return adminUsersRoute(request);
}

export { dynamic };
