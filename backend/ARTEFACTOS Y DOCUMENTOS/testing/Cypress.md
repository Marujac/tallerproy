# Cypress E2E tests

## Requisitos

- Node 20.x
- App corriendo localmente (`npm run dev` o `docker compose -f docker-compose.app.yml up`)
- Variables:
  - `CYPRESS_BASE_URL` (opcional, por defecto `http://localhost:9002`)
  - `ADMIN_KEY` para probar endpoints `/api/admin/*` (se inyecta en `Cypress.env('adminKey')`).

## Comandos

- `npm run cypress:open` abre la UI interactiva.
- `npm run cypress:run` ejecuta en modo headless (usado en CI).

## Estructura

- `cypress/e2e/auth.cy.js`: smoke tests para redirección al login y validación del endpoint `/api/analyze`.
- `cypress/support/e2e.js`: hooks y comandos compartidos.
- `cypress.config.js`: configuración central (baseUrl, viewport, etc.).

## Flujo sugerido

1. Ejecuta la app (`npm run dev`).
2. En otra terminal, corre `npm run cypress:open`.
3. Selecciona el spec `auth.cy.js` y verifica que pase.

## Próximos pasos

- Agregar helpers para iniciar sesión mediante API y probar flujos completos (análisis + historial).
- Integrar Cypress al pipeline (GitHub Actions) con `npm run cypress:run`.

