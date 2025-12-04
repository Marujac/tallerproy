# TutorVirtual IA Monorepo
Aplicacion web de lectura critica con IA (Genkit + Gemini), Next.js 15 y MongoDB. Incluye backend (carpeta `backend`), frontend (App Router), mocks y artefactos de documentacion.

## 1) Requisitos
- Node.js >= 18.x
- npm >= 9.x
- Git
- Opcional: MongoDB local o URI de Atlas
- Opcional: Vercel u otro proveedor para despliegue

## 2) Clonar
```bash
git clone https://github.com/Marujac/tallerproy.git
cd tallerproy
```
Usa tu propio remoto si aplica.

## 3) Estructura
```
tallerproy/
|- backend/                  # Codigo backend consumido por las rutas API de Next
|  |- ai/                    # Flujos IA (Genkit + Gemini)
|  |- config/                # Conexion MongoDB
|  |- controllers/           # Auth y logica
|  |- middleware/            # Guard de auth
|  |- routes/                # API (auth, history, schedule, admin)
|  |- services/              # Servicios y store en memoria (modo demo)
|  `- server.js
|- frontend/                 # App Next.js (App Router)
|- mock/                     # JSON Server para pruebas rapidas
|- cypress/                  # E2E
|- docs/ y ARTEFACTOS...     # Entregables/artefactos del proyecto
`- package.json              # Scripts de raiz
```
Alias: `@/backend/*` y `@backend/*` apuntan a `../backend/*`.

## 4) Variables de entorno
Crear `.env` (raiz) o configurarlas en el host:
```
AUTH_SECRET=clave_jwt_obligatoria
MONGODB_URI=mongodb://localhost:27017/tutorvirtual
MONGODB_DB=tutorvirtual
GEMINI_API_KEY=tu_clave_gemini   # opcional IA
DEMO_AUTH=true                  # opcional: modo demo sin Mongo
ADMIN_KEY=clave_admin           # para endpoints admin
```
Frontend: ver `frontend/.env.example` (por ejemplo `NEXT_PUBLIC_SITE_URL`).

## 5) Instalacion
```bash
npm install
```

## 6) Comandos principales (raiz)
```bash
npm run dev               # Next + API (puerto 9002)
npm run build && npm start# Produccion local
npm run lint              # Lint frontend
npm test                  # Jest
npm run cypress:run       # Cypress E2E
npm run mock:server       # JSON Server mock
npm run app:docker:up     # Compose app completa (app + Mongo + n8n + Mailhog)
npm run app:docker:down
```

## 7) Docker (app completa)
UI http://localhost:9002, n8n http://localhost:5678, Mailhog http://localhost:8025. Copia `.env.docker.example` a `.env` y define `AUTH_SECRET` (y Mongo si no usas demo). El `docker-compose.app.yml` ya monta `.env` como `env_file`, asi que puedes levantar todo con:
```bash
docker compose -f docker-compose.app.yml --env-file .env up --build
```
Esto asegura que Cypress/registro lean las credenciales reales desde `.env` dentro del contenedor.

## 8) Pruebas
- Jest (unit/integration): `npm test`, `npm run test:watch`, `npm run test:coverage`
- E2E Cypress: `npm run cypress:open` o `npm run cypress:run`
- En contenedor: `npm run test:docker` o `npm run test:docker:mongo`

## 9) Mock API
```bash
npm run mock:server
```
Usa `mock/server.js` con datos de `mock/db.json` y rutas de `mock/routes.json`.

## 10) Despliegue rapido (Vercel)
Configura `AUTH_SECRET`, `MONGODB_URI`, `MONGODB_DB`, `GEMINI_API_KEY` (opcional). Importa el repo y despliega; App Router se detecta automaticamente.

## 11) Notas
- Mantener alias de imports apuntando a `backend`.
- Si reubicas carpetas, actualiza `frontend/jsconfig.json` y `frontend/jest.config.js`.
- Revisa politicas de cookies/JWT para produccion (secure/samesite).
