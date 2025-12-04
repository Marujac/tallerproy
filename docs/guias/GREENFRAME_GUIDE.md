# Guia de GreenFrame y medicion

## Instalacion rapida
- Instala la CLI de GreenFrame siguiendo la documentacion oficial (`npm i -g @marmelab/greenframe` o via npx segun preferencia).
- Asegura que la app corra en `http://localhost:3000` antes de lanzar los escenarios.

## Escenarios definidos
- Archivo `greenframe.json` en la raiz:
  - **GreenProjectList - Initial Visit**: visita `/projects` y espera 2 s (cache inicial).
  - **GreenProjectList - Expand Tasks (Lazy Load)**: visita `/projects`, hace click en el primer proyecto (`data-testid="project-trigger-p1"`) y espera 2 s para medir la carga perezosa.
  - **GreenProjectList - Cache Hit (Reload)**: revisita `/projects` y espera 1 s para medir el impacto del cache de sesion.
- Umbrales de energia incluidos para browser/screen/network. Si se superan, el escenario se marca como no verde.

## Ejecucion
```bash
greenframe run -c greenframe.json
# o
npx greenframe run -c greenframe.json
```

## Lectura de resultados
- Revisa los consumos por categoria (browser, screen, network) y verifica que esten por debajo de los umbrales declarados.
- Usa los IDs `project-trigger-*` y `project-item-*` ya presentes en la UI para estabilizar los selectors de GreenFrame.

## Alternativa con Lighthouse
- Ejecuta `npm run energy:measure` para generar reportes HTML/JSON y una estimacion de energia por visita (modelo simplificado en `tools/measure-energy.js`).
- Ejecuta `npm run energy:compare` para contrastar `/projects` vs `/projects-standard` y obtener porcentajes de mejora en energia, performance y bytes.
