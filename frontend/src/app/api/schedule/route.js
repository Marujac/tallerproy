import { getScheduleRoute, saveScheduleRoute } from '@/backend/routes/schedule';

export async function GET(request) {
  return getScheduleRoute(request);
}

export async function PUT(request) {
  return saveScheduleRoute(request);
}
