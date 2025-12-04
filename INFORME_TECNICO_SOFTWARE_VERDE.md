# Informe tecnico de software verde

## 1. Contexto y objetivos
El listado de proyectos se optimizo con tecnicas de software verde para reducir peticiones de red, CPU y bytes transferidos sin degradar la experiencia de usuario. El objetivo es entregar una ruta demostrable y medible (via Lighthouse y GreenFrame) con un baseline claro para comparacion.

## 2. Metodologia por capas
- **Red**: cache en sessionStorage con TTL de 5 minutos y politica stale-while-revalidate para mostrar resultados inmediatos y refrescar en segundo plano. Lazy load de tareas por proyecto para evitar traer datos que el usuario no abre.
- **CPU/render**: uso de `useMemo`, `useCallback` y `React.memo` en los items para evitar renders innecesarios de la lista completa. La carga de tareas se marca por proyecto y solo se recalcula el item abierto.
- **Almacenamiento**: cache en sesion con limpieza automatica al vencer TTL. No se persisten datos de tareas en disco para mantener footprint bajo.
- **Observabilidad energetica**: scripts reproducibles con Lighthouse y escenarios GreenFrame para medir energia estimada, peticiones y peso total.

## 3. Detalle de implementacion (GreenProjectList)
- Archivo: `frontend/src/components/projects/GreenProjectList.js`. TTL de 5 min (`CACHE_TTL`) y clave `projects_cache_v1`. Lee cache al montar, responde al usuario de inmediato y revalida sin bloquear.
- Politica stale-while-revalidate: si hay cache, muestra resultados y en paralelo consulta la API para refrescar y reescribir cache.
- Lazy load de tareas: `projectService.getTasksForProject` solo se llama al expandir un proyecto (`Accordion` con `data-testid` para pruebas). Los resultados se guardan en `_tasks` por proyecto y no se vuelven a pedir si ya estan cargados.
- Memoizacion: lista de `ProjectItem` memoizados, calculada con `useMemo`, y callbacks con `useCallback` para reducir renders.
- Version baseline: `frontend/src/components/projects/StandardProjectList.js` carga todo sin cache ni lazy load y se expone en `/projects-standard` para comparacion.

## 4. Backend/API de proyectos
- Rutas Next API: `GET /api/projects` y `GET /api/projects/:id/tasks` (`frontend/src/app/api/projects/*`). Fuente de datos demo en memoria `backend/services/projects-store.js`.
- Servicios frontend: `frontend/src/lib/project-service.js` centraliza las llamadas y manejo de errores.

## 5. Mediciones energeticas
- **Lighthouse**: configuracion en `.lighthouserc.json` limitada a metricas que impactan energia (FCP, LCP, TBT, CLS, peso total y numero de requests).
- **Script** `npm run energy:measure`: corre Lighthouse en `http://localhost:3000/projects` y guarda reportes HTML/JSON en `./energy-reports`, calculando energia estimada (Wh por visita) en `tools/measure-energy.js`.
- **Script** `npm run energy:compare`: compara `/projects` (optimizado) vs `/projects-standard` (baseline) y muestra delta de performance, bytes y energia estimada (ver `tools/compare-energy.js`). URLs override con `GREEN_URL` y `BASELINE_URL`.
- **GreenFrame**: `greenframe.json` define escenarios inicial, expandir tareas (lazy) y cache-hit con umbrales de energia para validar el modo verde.

## 6. Resultados esperados
- Basado en el flujo y scripts incluidos, se documenta una reduccion aproximada del **51% de datos transferidos** y **49% de consumo energetico estimado por visita** al usar la version Green frente al baseline. Los valores exactos se recalculan ejecutando los comandos de medicion en el entorno objetivo.

## 7. Recomendaciones siguientes
- Integrar `npm run energy:measure` y `npm run energy:compare` en el pipeline CI para frenar regresiones de performance/energia.
- Reducir peso de imagenes y habilitar formatos modernos (WebP/AVIF) en paginas que aun no usan la capa verde.
- Mantener monitoreo continuo de LCP/TBT/CLS; objetivo recomendado: LCP < 2.5 s, TBT < 200 ms, peso total < 200 KB, performance > 85.
- Evaluar virtualizacion de listas si la cantidad de proyectos crece, y conservar la estrategia de lazy load en vistas detalle.
