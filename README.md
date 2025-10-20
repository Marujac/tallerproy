# Tutor de Lectura Crítica

Aplicación web con Next.js que utiliza IA (Genkit + Gemini) para analizar textos, detectar falacias/sesgos, generar cuestionarios y ayudar a mejorar el pensamiento crítico. Persistencia en MongoDB.

## Estructura y Organización

- Organización del Proyecto: Next.js (App Router) combina lógica de servidor y cliente dentro de `src/app`.
  - `src/app`: Páginas y rutas API.
  - `src/components`: Componentes de React reutilizables.
  - `src/ai`: Lógica de IA con Genkit.
  - `src/lib/mongodb.js`: Conexión a MongoDB.
- Organización de Pruebas: pruebas junto a componentes en `__tests__`.
- Documentación: este archivo `README.md`.

## Base de Datos: MongoDB

- Variables de entorno requeridas:
  - `MONGODB_URI`: cadena de conexión a la base de datos.
  - `MONGODB_DB`: nombre de la base de datos.
- Cliente reutilizable en `src/lib/mongodb.js` con caché para evitar múltiples conexiones.
- Colección usada: `history`.
  - Documento: `{ text, fallacies: [], questions: [], score: number, timestamp: number, userId?: string | null }`.

## Endpoints

- `POST /api/analyze`: analiza texto y devuelve `fallacies`.
- `POST /api/history`: guarda una entrada de historial.
- `GET /api/history?userId=...` (opcional): lista historial (filtra por `userId` si se envía).

## Desarrollo

- `npm run dev` — inicia Next.js en modo desarrollo.
- `npm test` — ejecuta pruebas (Jest + Testing Library).

## Notas de Migración

- Firebase y sus referencias fueron eliminadas. La autenticación y Firestore ya no se usan.
- Se migraron archivos clave a JavaScript (`.js`/`.jsx`). Algunos componentes UI pueden seguir en TypeScript; no afecta al uso.

Para comenzar, abre `src/app/page.jsx`.

## Modo Demo (sin MongoDB)

- Antes de conectar MongoDB, puedes probar login con credenciales de ejemplo.
- Variables de entorno:
  - `AUTH_SECRET` — clave para firmar JWT
  - Opcional: `DEMO_AUTH=1` para forzar modo demo
  - Opcional: `DEMO_USER_EMAIL` (por defecto `demo@demo.com`)
  - Opcional: `DEMO_USER_PASSWORD` (por defecto `demo1234`)
  - Opcional: `DEMO_USER_NAME` (por defecto `Demo User`)
- En modo demo (o si no hay `MONGODB_URI`/`MONGODB_DB`), podrás iniciar sesión con esas credenciales sin necesidad de base de datos.
