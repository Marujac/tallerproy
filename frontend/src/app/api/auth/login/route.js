import { loginRoute } from '@/backend/routes/auth';

export async function POST(request) {
  return loginRoute(request);
}
