# TutorVirtual IA – Backend
Monorepo del tutor de lectura critica TutorVirtual, que integra:

- Backend: modulos Node/Next (App Router) + MongoDB + JWT bajo `backend/backends/`
- Frontend: Next.js 15 (carpeta `frontend/`)
- IA: Genkit + Gemini (flujos en `backend/backends/ai/flows`)
- Mock API: JSON Server (`mock/`)
- Pruebas: Jest + Testing Library + Cypress
- Docker: compose para app, Mongo, n8n y Mailhog

## 1. Requisitos previos
- Node.js >= 18.x
- npm >= 9.x
- Git
- Opcional: MongoDB local o URI de MongoDB Atlas
- Opcional: Cuenta en Vercel / proveedor cloud

## 2. Clonar el repositorio
```bash
git clone https://github.com/Marujac/tallerproy.git
cd tallerproy
```
Sustituye la URL por el remoto que uses.

## 3. Estructura del proyecto
```
tallerproy/
├── backend/
│   └── backends/              # Codigo backend consumido por las rutas API de Next
│       ├── ai/                # Genkit + Gemini (flujos de IA)
│       ├── config/            # Conexion MongoDB
│       ├── controllers/       # Auth y logica de negocio
│       ├── middleware/        # Guard de auth
│       ├── routes/            # Handlers de API (auth, history, schedule, admin)
│       ├── services/          # Servicios y store en memoria para modo demo
│       └── server.js          # Punto de entrada documental
├── frontend/                  # Next.js (App Router)
├── mock/                      # JSON Server para pruebas rapidas
├── cypress/                   # E2E
├── docs/ y ARTEFACTOS...      # Entregables/artefactos del proyecto
└── package.json               # Scripts raiz (orquesta frontend/compose/tests)
```
Alias de import: `@/backend/*` y `@backend/*` apuntan a `../backend/backends/*`.

## 4. Variables de entorno
### Backend / IA (coloca en `.env` en la raiz o en Vercel)
```
AUTH_SECRET=clave_jwt_obligatoria
MONGODB_URI=mongodb://localhost:27017/tutorvirtual
MONGODB_DB=tutorvirtual
GEMINI_API_KEY=tu_clave_gemini   # opcional para IA
DEMO_AUTH=true                  # opcional: modo demo sin Mongo
ADMIN_KEY=clave_admin           # para endpoints admin
```

### Frontend (ver `frontend/.env.example`)
```
NEXT_PUBLIC_SITE_URL=http://localhost:9002
```

## 5. Instalacion de dependencias
Desde la raiz:
```bash
npm install
```

## 6. Ejecucion local
### App Next (frontend + API)
```bash
npm run dev   # porta 9002
```
El backend se sirve via rutas API de Next y reusa `backend/backends`.

### Modo demo sin Mongo
Configura `DEMO_AUTH=true` para usar usuario demo y store en memoria.

## 7. Docker (app completa)
```bash
npm run app:docker:up   # levanta app, Mongo, n8n, Mailhog
npm run app:docker:down
```
UI: http://localhost:9002, n8n: http://localhost:5678, Mailhog: http://localhost:8025.

## 8. Pruebas
- Unit/integ Jest: `npm test`, `npm run test:watch`, `npm run test:coverage`
- E2E Cypress: `npm run cypress:open` o `npm run cypress:run`
- Tests en contenedor: `npm run test:docker` o `npm run test:docker:mongo`

## 9. Mock API (JSON Server)
```bash
npm run mock:server   # usa mock/server.js
```
Sirve endpoints de `mock/db.json` con rutas reescritas segun `mock/routes.json`.

## 10. Despliegue rapido (Vercel)
1) Configura variables: `AUTH_SECRET`, `MONGODB_URI`, `MONGODB_DB`, `GEMINI_API_KEY` (opcional).  
2) Importa el repo y despliega; App Router detecta automaticamente.  
3) Si cambias variables, vuelve a desplegar.

## 11. Scripts utiles (resumen)
```bash
npm run dev                 # Next + API
npm run build && npm start  # Produccion local
npm run lint                # Lint frontend
npm test                    # Jest
npm run cypress:run         # Cypress
npm run mock:server         # Mock API
npm run app:docker:up       # Compose app completa
```

## 12. Notas
- Mantener los imports usando los alias apuntando a `backend/backends`.
- Si mueves carpetas, ajusta `frontend/jsconfig.json` y `frontend/jest.config.js`.
- Revisa politicas de cookies/JWT antes de produccion (secure/samesite).
