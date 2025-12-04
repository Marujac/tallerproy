import { getProjectTasksRoute } from '@/backend/routes/projects';

export async function GET(request, context) {
  return getProjectTasksRoute(request, context);
}
