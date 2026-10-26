# Chaska Store

Tienda virtual de electrónicos con catálogo y pedidos por WhatsApp.
El administrador agrega y quita productos.

## Stack acordado
- JavaScript en todo el proyecto; Node.js 22.13 o superior por `node:sqlite`.
- Cliente: React con Vite y Tailwind CSS.
- Servidor: Express en Node.js; SQLite mediante el módulo nativo `node:sqlite`.
- Validación: Zod. Pruebas: Vitest y supertest.

## Trabajo local
Comandos previstos desde la raíz (aún no existe `package.json`):
- `npm install`: instalar dependencias.
- `npm run dev`: iniciar cliente y servidor en desarrollo.
- `npm test`: ejecutar las pruebas automáticas.
- `npm start`: iniciar la aplicación en modo producción.

## Convenciones
- Elegir la solución más simple; implementar solo lo escrito en la spec.
- Proponer ideas nuevas antes de incorporarlas a la spec e implementarlas.
- Producto en español de Perú; precios en soles con dos decimales (`S/ 49.90`).
- Pedir solo datos imprescindibles; secretos fuera del código.
- Clave del administrador y número de WhatsApp en variables de entorno; documentarlas en `.env.example` sin secretos reales.
- Cada regla de negocio empieza con una prueba que falla; `npm test` debe pasar antes de cerrar una feature.
- Criterios de éxito comprobables desde la app por una persona no técnica.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md
