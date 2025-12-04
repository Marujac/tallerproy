import { NextResponse } from 'next/server';
import { listProjects, listTasks } from '../services/projects-store';

export async function getProjectsRoute() {
  try {
    const items = listProjects();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'No se pudieron obtener los proyectos' }, { status: 500 });
  }
}

export async function getProjectTasksRoute(_request, { params }) {
  try {
    const projectId = params?.id;
    if (!projectId) {
      return NextResponse.json({ error: 'ID de proyecto requerido' }, { status: 400 });
    }
    const tasks = listTasks(projectId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json({ error: 'No se pudieron obtener las tareas' }, { status: 500 });
  }
}
