const API_BASE = '/api/projects';

async function handleResponse(res, errorMessage) {
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error ? `: ${body.error}` : '';
    } catch {}
    throw new Error(`${errorMessage}${detail}`);
  }
  return res.json();
}

async function getProjects() {
  const res = await fetch(API_BASE, { cache: 'no-store' });
  return handleResponse(res, 'No se pudieron obtener los proyectos');
}

async function getTasksForProject(projectId) {
  const res = await fetch(`${API_BASE}/${projectId}/tasks`, { cache: 'no-store' });
  return handleResponse(res, 'No se pudieron obtener las tareas');
}

export const projectService = {
  getProjects,
  getTasksForProject,
};
