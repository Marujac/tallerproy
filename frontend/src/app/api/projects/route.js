import { getProjectsRoute } from '@/backend/routes/projects';

export async function GET(request) {
  return getProjectsRoute(request);
}
