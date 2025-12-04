// Demo data for green project list. In a real app this would live in MongoDB.
const tasksByProject = {
  p1: [
    { id: 'p1-t1', title: 'Auditoria de rendimiento', status: 'done', impact: 'Recorte de 30 KB en bundle' },
    { id: 'p1-t2', title: 'Activar cache de API', status: 'in-progress', impact: 'Menos peticiones en moviles' },
    { id: 'p1-t3', title: 'Optimizar imagenes', status: 'todo', impact: 'Ahorro de ancho de banda' },
    { id: 'p1-t4', title: 'Monitoreo energetico', status: 'todo', impact: 'Visibilidad continua' },
  ],
  p2: [
    { id: 'p2-t1', title: 'Paginar resultados', status: 'done', impact: 'Respuestas mas ligeras' },
    { id: 'p2-t2', title: 'CDN estatica', status: 'done', impact: 'Menos latencia global' },
    { id: 'p2-t3', title: 'Lazy load de graficos', status: 'in-progress', impact: 'CPU solo bajo demanda' },
  ],
  p3: [
    { id: 'p3-t1', title: 'Reducir consultas duplicadas', status: 'done', impact: 'Cache en capa de datos' },
    { id: 'p3-t2', title: 'Consolidar logs', status: 'in-progress', impact: 'Menos IO de disco' },
  ],
  p4: [
    { id: 'p4-t1', title: 'Refactor a componentes puros', status: 'done', impact: 'Re-render minimos' },
    { id: 'p4-t2', title: 'Medir CLS/LCP', status: 'done', impact: 'Base para optimizar energia' },
    { id: 'p4-t3', title: 'Implementar SWR en tarjetas', status: 'todo', impact: 'Datos frescos sin picos' },
  ],
};

const projects = [
  {
    id: 'p1',
    name: 'Portal Academico Verde',
    owner: 'Equipo UX',
    status: 'En curso',
    updatedAt: '2025-12-03T15:00:00Z',
    description: 'Reduccion de payload y render verde para la landing academica.',
  },
  {
    id: 'p2',
    name: 'Tablero de Seguimiento',
    owner: 'Equipo Datos',
    status: 'En curso',
    updatedAt: '2025-12-02T12:30:00Z',
    description: 'Dashboard con metricas en vivo y graficos diferidos.',
  },
  {
    id: 'p3',
    name: 'API de Recursos Educativos',
    owner: 'Equipo Backend',
    status: 'Planificado',
    updatedAt: '2025-11-29T09:45:00Z',
    description: 'API REST optimizada con cache y consolidacion de logs.',
  },
  {
    id: 'p4',
    name: 'Laboratorio de Experimentos IA',
    owner: 'Equipo IA',
    status: 'Piloto',
    updatedAt: '2025-11-27T08:20:00Z',
    description: 'Prototipos IA con mediciones de CLS/LCP y componentes puros.',
  },
];

export function listProjects() {
  return projects.map((project) => ({
    ...project,
    taskCount: (tasksByProject[project.id] || []).length,
  }));
}

export function listTasks(projectId) {
  return tasksByProject[projectId] ? [...tasksByProject[projectId]] : [];
}
