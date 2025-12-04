# Setup de medicion energetica

## Dependencias
- Lighthouse y chrome-launcher estan incluidos en `devDependencies` y se instalan con `npm install` (raiz).
- Requiere Google Chrome disponible en el host (el script lanza un Chrome headless).

## Comandos clave
- `npm run energy:measure`: ejecuta Lighthouse sobre `http://localhost:3000/projects` y guarda reportes HTML/JSON en `./energy-reports`. Usa la configuracion `.lighthouserc.json` y calcula energia estimada en `tools/measure-energy.js`.
- `npm run energy:compare`: corre Lighthouse para `/projects` (optimizado) y `/projects-standard` (baseline) y muestra delta de energia, performance, LCP/TBT/CLS y bytes. Variables opcionales: `GREEN_URL` y `BASELINE_URL`.
- `npm run mock:start`: levanta JSON Server en `http://localhost:3001` con `mock/db.json` y rutas definidas en `mock/json-server-config.json`.

## Metricas vigiladas y objetivos
- LCP < 2.5 s
- TBT < 200 ms
- CLS < 0.1
- Peso total < 200 KB y menos de 40 peticiones
- Performance score > 85

## Flujo sugerido
1) Levanta la app (`npm run dev`) y opcionalmente el mock (`npm run mock:start` si se prueba contra datos mock).  
2) Corre `npm run energy:measure` para obtener el reporte de la version verde.  
3) Corre `npm run energy:compare` para contrastar contra la version estandar `/projects-standard`.  
4) Revisa los reportes en `./energy-reports` y documenta los hallazgos en `docs/Reportes de Mejora Energetica`.
