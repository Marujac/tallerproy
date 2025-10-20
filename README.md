

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
