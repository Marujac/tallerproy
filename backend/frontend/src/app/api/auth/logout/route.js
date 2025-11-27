import { logoutRoute } from '@/backend/routes/auth';

export async function POST() {
  return logoutRoute();
}
