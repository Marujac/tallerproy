import { authMiddleware, config } from '@/backend/middleware/auth';

export async function middleware(request) {
  return authMiddleware(request);
}

export { config };
