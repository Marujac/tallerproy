

# Tutor de Lectura Crítica (TutorVirtual)

Aplicación web con Next.js que usa IA (Genkit + Gemini) para analizar textos, detectar falacias/sesgos, generar cuestionarios y ayudar a mejorar el pensamiento crítico. Persistencia en MongoDB.

## Estructura

- `src/app` — Páginas (App Router) y rutas API.
- `src/components` — Componentes de UI.
- `src/ai` — Flujos de IA con Genkit.
- `src/lib/mongodb.js` — Conexión a MongoDB.

## Base de datos

Variables en `.env`:
- `MONGODB_URI` — cadena de conexión
- `MONGODB_DB` — nombre de la base
- `AUTH_SECRET` — clave para firmar JWT

Colecciones:
- `users`: { name, email, passwordHash, createdAt }
- `history`: { userId, text, fallacies, questions, score, timestamp }

## Endpoints
- `POST /api/analyze` — analiza y devuelve `fallacies`.
- `GET /api/history` — lista historial del usuario logueado.
- `POST /api/history` — guarda entrada de historial.
- Auth: `POST /api/auth/{signup,login,logout}`, `GET /api/auth/me`.

## Desarrollo
- `npm install`
- `npm run dev`

## Pruebas en contenedores (Docker)

Esta sección añade una dockerización mínima para ejecutar Jest dentro de contenedores y, opcionalmente, levantar MongoDB con docker-compose.

1) Requisitos
- Docker Desktop instalado y corriendo.

2) Comandos rápidos
- Solo tests en contenedor (sin Mongo externo; usa mocks/mongodb-memory-server):
  - `npm run test:docker`
- Tests usando un Mongo real en contenedor (compose orquesta los servicios):
  - `npm run test:docker:mongo`

3) ¿Qué se creó?
- `Dockerfile`: imagen Node 20 que copia el repo y corre `npm test`.
- `docker-compose.yml` con 3 servicios:
  - `tests`: corre Jest directamente (sin DB externa).
  - `mongo`: inicia MongoDB 7.
  - `tests-mongo`: espera a Mongo y luego corre Jest (`docker/wait-for-mongo.sh`).
- `.dockerignore`: reduce el contexto de build (ignora `node_modules`, `.next`, etc.).

4) Flujo recomendado
- Desarrollo local rápido: `npm test` en tu máquina (sin Docker).
- Verificación/reproducibilidad: `npm run test:docker` (misma imagen en cualquier equipo/CI).
- Pruebas con DB real: `npm run test:docker:mongo` (compose levanta Mongo + runner).

5) Cobertura en contenedor
- Ejecuta: `docker compose run --rm tests npm run test:coverage`.
  Los reportes quedan dentro del contenedor, pero también puedes montar el repo si prefieres persistirlos fuera.

## Notas
- Middleware + guardas de cliente requieren login antes de ver la app.

## Despliegue

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jcesarqz/TutorVirtual&project-name=tutorvirtual&repository-name=TutorVirtual)

1) En Vercel, al crear el proyecto, configura las variables de entorno:
   - `AUTH_SECRET` (cadena larga y aleatoria)
   - `MONGODB_URI` (cadena de conexión de Atlas)
   - `MONGODB_DB` (por ejemplo `tutorcritico`)
   - `GEMINI_API_KEY` (opcional, para Genkit + GoogleAI)
2) Haz el primer deploy; Next.js detecta automáticamente la app (App Router).
3) Si cambias variables, vuelve a desplegar para aplicarlas.


## Configuración de entorno

1. Copia .env.example a .env.
2. Completa los valores requeridos:
   - AUTH_SECRET (cadena larga y aleatoria)
   - MONGODB_URI y MONGODB_DB
   - GEMINI_API_KEY (opcional si usas Genkit + GoogleAI)
3. Inicia la app: 
pm install y 
pm run dev.
## Ejecutar la app con Docker (producción)

Se añadió `Dockerfile.app` y `docker-compose.app.yml` para levantar la aplicación Next.js junto a MongoDB.

1) Variables de entorno
- Copia `.env.docker.example` a `.env` o exporta las variables en tu terminal.
- Asegúrate de definir `AUTH_SECRET` con una cadena segura.

2) Levantar servicios
- `docker compose -f docker-compose.app.yml up --build`
- Abre `http://localhost:9002`.

3) Detener y limpiar
- `docker compose -f docker-compose.app.yml down`

Notas:
- Si prefieres modo demo (sin Mongo), descomenta `DEMO_AUTH=true` en `docker-compose.app.yml` o en tu `.env`.
- El servicio `app` expone `3000` internamente y se publica en `9002` en tu máquina.
