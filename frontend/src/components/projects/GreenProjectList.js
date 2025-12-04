'use client';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService } from '@/lib/project-service';

const CACHE_TTL = 5 * 60 * 1000;
const CACHE_KEY = 'projects_cache_v1';

function readCache() {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !parsed?.data) return null;
    if (Date.now() - parsed.ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function writeCache(data) {
  if (typeof sessionStorage === 'undefined') return;
  const payload = { ts: Date.now(), data };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ProjectItem = memo(function ProjectItem({ project, isOpen }) {
  return (
    <AccordionItem
      value={project.id}
      key={project.id}
      data-testid={`project-item-${project.id}`}
      className="border rounded-lg mb-2 shadow-sm"
    >
      <AccordionTrigger
        data-testid={`project-trigger-${project.id}`}
        className="px-4"
      >
        <div className="flex flex-col items-start gap-2 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700">
              {project.status}
            </span>
            <span className="text-xs text-muted-foreground">Owner: {project.owner}</span>
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">{project.name}</p>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Actualizado: {formatDate(project.updatedAt)} • Tareas: {project.taskCount}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4">
        <div className="rounded-md bg-muted/40 p-3">
          <p className="text-sm font-medium mb-2">Tareas (lazy load)</p>
          {project._taskError ? (
            <p className="text-sm text-red-600">{project._taskError}</p>
          ) : project._loadingTasks ? (
            <div className="space-y-2" data-testid={`project-tasks-loading-${project.id}`}>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : project._tasks ? (
            <ul className="space-y-2" data-testid={`project-tasks-${project.id}`}>
              {project._tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded border bg-white px-3 py-2 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.impact}</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded bg-slate-100 text-slate-700">
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Expande el proyecto para cargar las tareas.</p>
          )}
        </div>
        {isOpen && !project._tasks && !project._loadingTasks && (
          <p className="text-xs text-amber-600 mt-2">
            Carga perezosa activa: aun no se solicitan las tareas hasta que las necesites.
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
});

export function GreenProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openProject, setOpenProject] = useState('');
  const [usedCache, setUsedCache] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async (showLoading) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const data = await projectService.getProjects();
        if (cancelled) return;
        setProjects((prev) => {
          const merged = data.map((project) => {
            const existing = prev.find((p) => p.id === project.id);
            return existing
              ? { ...project, _tasks: existing._tasks, _taskError: existing._taskError }
              : project;
          });
          writeCache(merged.map(({ _tasks, _taskError, _loadingTasks, ...rest }) => rest));
          return merged;
        });
      } catch (err) {
        if (!cancelled) setError(err.message || 'No se pudieron cargar los proyectos');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    const cached = readCache();
    if (cached) {
      setProjects(cached);
      setLoading(false);
      setUsedCache(true);
      setRefreshing(true);
      fetchProjects(false);
    } else {
      fetchProjects(true);
    }

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const loadTasksForProject = useCallback(async (projectId) => {
    setProjects((prev) => {
      const project = prev.find((p) => p.id === projectId);
      if (!project || project._tasks || project._loadingTasks) return prev;
      return prev.map((p) => (p.id === projectId ? { ...p, _loadingTasks: true, _taskError: null } : p));
    });
    try {
      const tasks = await projectService.getTasksForProject(projectId);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, _tasks: tasks, _loadingTasks: false, _taskError: null } : p
        )
      );
    } catch (err) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, _loadingTasks: false, _taskError: err.message || 'No se pudieron cargar las tareas' }
            : p
        )
      );
    }
  }, []);

  const handleOpenChange = useCallback(
    (value) => {
      setOpenProject(value || '');
      if (value) loadTasksForProject(value);
    },
    [loadTasksForProject]
  );

  const items = useMemo(
    () =>
      projects.map((project) => (
        <ProjectItem key={project.id} project={project} isOpen={openProject === project.id} />
      )),
    [projects, openProject]
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos (Green)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cache en sesion + stale-while-revalidate + carga perezosa de tareas
          </p>
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
          <CardTitle>Proyectos (Green)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => {
              setError(null);
              setLoading(true);
              // Trigger initial effect logic via state reset.
              setProjects([]);
              setUsedCache(false);
              setRefreshing(false);
              setOpenProject('');
              sessionStorage.removeItem(CACHE_KEY);
              setReloadToken((token) => token + 1);
            }}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="green-list-header">
        <CardTitle>Proyectos (Green)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Optimizado: cache en sesion, carga perezosa de tareas, componentes memoizados
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {usedCache && <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700">Cache en sesion</span>}
          {refreshing && <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">Actualizando en background</span>}
          <span className="px-2 py-1 rounded bg-slate-50 text-slate-700">TTL cache: 5 min</span>
          <span className="px-2 py-1 rounded bg-slate-50 text-slate-700">Politica: stale-while-revalidate</span>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay proyectos cargados.</p>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={openProject}
            onValueChange={handleOpenChange}
            className="w-full"
          >
            {items}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
