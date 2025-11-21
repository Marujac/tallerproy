import { meRoute } from '@/backend/routes/auth';

export async function GET(request) {
  return meRoute(request);
}
