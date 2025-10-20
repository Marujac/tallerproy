

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

## Notas
- Middleware + guardas de cliente requieren login antes de ver la app.
