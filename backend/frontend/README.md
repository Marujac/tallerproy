# Tutor de Lectura Critica (TutorVirtual)

Aplicacion web con Next.js (App Router) que usa IA (Genkit + Gemini) para analizar textos, detectar falacias/sesgos, generar cuestionarios y apoyar el pensamiento critico. Persistencia en MongoDB.

## Estructura

- `backend/` - Capa backend organizada:
  - `config/`, `controllers/`, `routes/`, `middleware/`, `services/`, `ai/`, `server.js`.
- App Next.js en `frontend/`:
  - `src/` - Paginas App Router, componentes y hooks (alias `@/`).
  - `middleware.js` - Guarda que importa de `@/backend/...`.
  - Config: `next.config.mjs`, `jsconfig.json`, `tailwind.config.js`, etc.
  - Tests/e2e: `jest.config.js`, `cypress/` (carpeta en la raiz), `__mocks__/`.
- Alias `@/backend/*` apunta a `../backend/*` desde `frontend`.
- Archivos Docker/compose y `package.json` estan en la raiz.

## Variables de entorno

- `AUTH_SECRET` - clave para firmar JWT (obligatoria).
- `MONGODB_URI` y `MONGODB_DB` - conexion a MongoDB.
- `GEMINI_API_KEY` - clave para Genkit + GoogleAI (opcional).
- `DEMO_AUTH` - `1` para modo demo sin Mongo (usa usuario demo).
- `ADMIN_KEY` - clave para endpoints admin.

## Endpoints principales

- `POST /api/analyze` - analiza texto y devuelve `fallacies`.
- `GET /api/history` - lista historial del usuario logueado.
- `POST /api/history` - guarda entrada de historial.
- Auth: `POST /api/auth/{signup,login,logout}`, `GET /api/auth/me`.
- Admin: `GET /api/admin/{history,users}` con cabecera `x-admin-key`.

## Desarrollo rapido (desde la raiz)

- `npm install`
- `npm run dev`
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Lint: `npm run lint`

## Pruebas en contenedores (Docker)

- Solo tests en contenedor (sin Mongo externo; usa mocks/mongodb-memory-server):
  - `npm run test:docker`
- Tests usando un Mongo real en contenedor (compose orquesta los servicios):
  - `npm run test:docker:mongo`
- Cobertura en contenedor:
  - `docker compose -f docker-compose.yml run --rm tests npm run test:coverage`

## Automatizacion con n8n (HU10 recordatorios por correo)

- Levanta app + Mongo + n8n + Mailhog: `docker compose -f docker-compose.app.yml up --build`
  - UI app: `http://localhost:9002`
  - n8n: `http://localhost:5678`
  - Mailhog (correos de prueba): `http://localhost:8025` (SMTP host `mailhog`, puerto `1025`)
- En n8n, importa `docs/n8n/hu10-recordatorios-email.json` (menu Import from file/clipboard).
- Configura credenciales SMTP en el nodo **Enviar correo** (usa Mailhog para demo o tu SMTP real).
- El nodo HTTP usa `http://app:3000/api/admin/reminders` (dentro de docker-compose) con cabecera `x-admin-key` (se inyecta desde `ADMIN_KEY` en `.env`). Si ejecutas n8n fuera de compose, apunta a `http://localhost:9002/api/admin/reminders`.
- Ajusta la frecuencia en el nodo **Cron (diario/semanal)** (weekday=1 es lunes). Para demos rápidas, cambia a “Every X minutes”.
- Activa el workflow y dispara manualmente (Execute workflow) para ver los correos llegar a Mailhog.

## Despliegue (Vercel)

1. Configura variables en Vercel: `AUTH_SECRET`, `MONGODB_URI`, `MONGODB_DB`, `GEMINI_API_KEY` (opcional).
2. Crea el proyecto y despliega; Next detecta App Router automaticamente.
3. Si cambias variables, vuelve a desplegar.

## Ejecutar la app con Docker (produccion)

1. Copia `.env.docker.example` a `.env` y define `AUTH_SECRET`.
2. Levanta servicios: `docker compose -f docker-compose.app.yml up --build`.
3. Accede a `http://localhost:9002`. Para detener: `docker compose -f docker-compose.app.yml down`.
4. Para modo demo sin Mongo, habilita `DEMO_AUTH=true` en `.env`.

## Notas

- El middleware exige login para acceder a la app (redirige a `/login` si falta token).
- No expongas claves reales en repositorios; rota las que aparecen en `.env`.
