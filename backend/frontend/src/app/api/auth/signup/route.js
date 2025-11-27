import { signupRoute } from '@/backend/routes/auth';

export async function POST(request) {
  return signupRoute(request);
}
