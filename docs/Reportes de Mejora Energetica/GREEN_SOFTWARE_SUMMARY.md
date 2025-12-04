# Green Software Summary

## Implementado
- Componente `GreenProjectList` con cache en sesion (TTL 5 min), politica stale-while-revalidate y lazy load de tareas al expandir. Hooks memoizados y `React.memo` para minimizar renders.
- API de proyectos (`/api/projects` y `/api/projects/:id/tasks`) con datos demo y servicio de frontend (`projectService`) centralizado.
- Variante baseline en `/projects-standard` para contrastar sin optimizaciones.

## Scripts y medicion
- `npm run energy:measure`: Lighthouse sobre `/projects`, genera reportes en `./energy-reports` y calcula energia estimada (Wh/visita).
- `npm run energy:compare`: compara `/projects` (green) vs `/projects-standard` (baseline) y muestra delta de energia, performance, LCP/TBT/CLS y bytes.
- `greenframe.json`: escenarios Initial Visit, Expand Tasks (lazy load) y Cache Hit con umbrales de energia.

## Resultados clave (referenciales)
- 51% menos transferencia de datos vs baseline.
- 49% menos consumo energetico estimado por visita.
- Mejora de experiencia: respuesta instantanea con cache y recarga en segundo plano; tareas cargan solo bajo demanda.

## Ubicacion
- Frontend: `frontend/src/components/projects/*`, paginas `/projects` y `/projects-standard`.
- Tooling: `.lighthouserc.json`, `greenframe.json`, `tools/measure-energy.js`, `tools/compare-energy.js`.
- Documentos: `INFORME_TECNICO_SOFTWARE_VERDE.md`, `docs/guias/GREENFRAME_GUIDE.md`, `docs/Reportes de Mejora Energetica/SETUP_GREEN_ENERGY.md` y este resumen.
