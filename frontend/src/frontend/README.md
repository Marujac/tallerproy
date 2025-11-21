Estructura de frontend

- Esta carpeta agrupa entradas de frontend para mantener la separación conceptual de capas.
- Por compatibilidad, los componentes y hooks originales siguen en `src/components` y `src/hooks`.
- Los archivos aquí son shims que reexportan desde su ubicación original. Así puedes importar desde `@/frontend/...` sin romper el código existente.
- A futuro, puedes mover definitivamente los archivos a `src/frontend` y dejar shims inversos en `src/components` si deseas completar la migración.

