'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService } from '@/lib/project-service';

export function StandardProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const base = await projectService.getProjects();
        const projectsWithTasks = await Promise.all(
          base.map(async (project) => {
            const tasks = await projectService.getTasksForProject(project.id);
            return { ...project, tasks };
          })
        );
        setProjects(projectsWithTasks);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos (Standard)</CardTitle>
          <p className="text-sm text-muted-foreground">Carga todo de una sola vez (sin optimizaciones)</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos (Standard)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos (Standard)</CardTitle>
        <p className="text-sm text-muted-foreground">Lista sin cache ni carga perezosa</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded border p-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base font-semibold">{project.name}</p>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-slate-100 text-slate-700">
                {project.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Owner: {project.owner}</p>
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Tareas (precarga)</p>
              <ul className="space-y-1">
                {project.tasks?.map((task) => (
                  <li key={task.id} className="flex justify-between rounded bg-white border px-2 py-1">
                    <span className="text-sm">{task.title}</span>
                    <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded bg-slate-50 text-slate-700">
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
