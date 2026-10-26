# Implementation Plan: Chaska Store — catálogo y pedidos por WhatsApp

**Branch**: `001-chaska-catalogo-whatsapp` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Especificación de `specs/001-chaska-catalogo-whatsapp/spec.md`, incluida la precisión aceptada de cookie de sesión y revocación en servidor al salir.

**Estado**: Implementación realizada; consultar [tasks.md](tasks.md) y [validation.md](validation.md) para 58/60 tareas verificadas y el bloqueo de arranque de producción del entorno.

## Summary

Catálogo de celulares, laptops y accesorios con búsqueda, categoría, detalle y pedido persistente en el navegador. El servidor revalida productos e importes y prepara un enlace de WhatsApp, sin guardar ventas ni enviar mensajes. Administración con clave única para agregar o quitar productos, siguiendo las seis imágenes validadas.

Un paquete JavaScript con React/Vite/Tailwind y API Express con SQLite nativo. Producto y foto normalizada se guardan juntos. En producción Express sirve el cliente compilado; sin ORM, servicios separados, cuentas de compradores, pagos ni gestión de pedidos.

## Technical Context

**Language/Version**: JavaScript ESM; Node >=22.13.0, preferentemente LTS compatible 22 o 24. Entorno observado: Node 25.2.1.

**Primary Dependencies**: React 19, React Router, Vite 8/plugin-react 6, Tailwind 4/plugin Vite, Express 5, Zod 4; Multer 2 y Sharp para la foto. Congelar versiones exactas con lockfile al implementar; fuentes y compatibilidad en [research](research.md).

**Storage**: Archivo SQLite durable mediante `DatabaseSync`; fotos BLOB en la fila del producto; pedido versionado en `localStorage`. Sesiones revocables en SQLite con cookie de sesión y sin TTL. Sin tablas de clientes o pedidos.

**Testing**: Vitest 4.1.12, supertest 7, React Testing Library y jsdom. Regla de negocio → prueba ejecutada en rojo → implementación → prueba verde. Bases temporales aisladas; comprobación manual de pantallas y comportamiento real del navegador.

**Target Platform**: Navegadores modernos compatibles con Tailwind 4; Node en Windows/Linux con disco durable y producción HTTPS bajo un solo origen. Compra validada a 360/390/1440 px; administración a 1440 px.

**Project Type**: Aplicación web con API HTTP pública/privada y enlace saliente a WhatsApp.

**Performance Goals**: Cumplir SC-001–SC-003; sin SLA de concurrencia aprobado. Listados sin BLOBs, fotos bajo demanda y normalización hasta 1600 px. Distinguir estados de carga y no bloquear acciones con falsas confirmaciones. No hay mediciones ejecutadas en esta fase.

**Constraints**: Stack acordado sin TypeScript ni ORM; dinero entero en céntimos; una imagen JPG/PNG/WebP de hasta 5 000 000 bytes; secretos solo en servidor y ejemplos ficticios en `.env.example`; SQLite síncrono con operaciones pequeñas y un proceso inicial. Solo FR-001–FR-024. Límites documentados: nombre 200 y descripción/especificaciones 5000 caracteres Unicode cada una tras trim; JSON 65 536 bytes UTF-8, campo multipart 20 000 bytes y cuerpo multipart 5 100 000 bytes, todos inclusivos y sin truncamiento.

**Scale/Scope**: Una tienda, un administrador, tres categorías y seis pantallas. Catálogo pequeño sin paginación, con filtro en cliente. Usar 100 productos como escenario técnico de comprobación, sin convertirlo en límite comercial. No se promete escalado horizontal.

## Constitution Check

Puerta previa a fase 0 y revisión posterior al diseño:

| Principio | Evidencia de diseño | Estado |
| --- | --- | --- |
| I. Simplicidad | Un paquete, un proceso Express, SQLite nativo y pedido local. | Conforme |
| II. Idioma y mercado | Textos es-PE, formateador compartido y céntimos enteros. | Conforme |
| III. Cero alcance fantasma | Contratos para los 24 requisitos y seis pantallas; precisión de sesión aprobada e integrada en la spec. | Conforme |
| IV. Verificable | Quickstart vincula cada SC a acciones observables. | Conforme |
| V. Respeto de datos | Cero datos personales solicitados al comprador; secretos en servidor, token HttpOnly y revocación del lado servidor. | Conforme |
| VI. Pruebas primero | Pruebas rojas antes de cada regla y `npm test` antes del cierre. | Conforme como estrategia; aún sin implementación. |

**D1 — Resuelta**: el usuario aceptó una cookie de sesión y su posible restauración por el navegador; “Cerrar sesión” siempre revoca el acceso en servidor. FR-020, escenario 10 y SC-005 reflejan esta precisión. No se añaden vencimientos por tiempo o inactividad ni detección de cierre mediante eventos no fiables. [Evidencia primaria](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

**Revisión posterior a fase 1**: los seis principios se satisfacen en el diseño, sin excepciones ni decisiones abiertas. Las pruebas y recorridos son obligaciones de implementación, no comprobaciones ya realizadas. La calidad de la spec se revalida en 16/16 controles.

## Project Structure

### Documentation (this feature)

```text
specs/001-chaska-catalogo-whatsapp/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── contracts/
    ├── catalog-order.md
    ├── admin.md
    └── ui.md
```

Contratos: [catálogo y pedido](contracts/catalog-order.md), [administración y sesión](contracts/admin.md), [pantallas](contracts/ui.md). `tasks.md` corresponde a `$speckit-tasks`, no a este comando.

### Source Code (repository root)

Estructura prevista; no se crean estos archivos durante planificación:

```text
package.json
package-lock.json
.env.example
.gitignore
vite.config.js
vitest.config.js
client/
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    ├── pages/
    ├── components/
    ├── order/
    └── api.js
server/
├── index.js
├── app.js
├── config.js
├── db.js
├── auth.js
├── products.js
├── photos.js
└── order-preview.js
shared/
├── validation.js
└── money.js
tests/
├── unit/
├── integration/
├── client/
└── fixtures/
data/                  # SQLite, ignorado por Git
dist/client/           # compilación, ignorada por Git
```

**Structure Decision**: Un paquete raíz evita workspaces y scripts duplicados. `server/app.js` permite inyectar base y configuración sin abrir puerto para supertest; `index.js` inicia el proceso. `shared` solo incluye validación y dinero, nunca secretos o SQLite importables por el cliente. No añadir capas genéricas de repositorios.

## Diseño y validación previstos

Fase 0 completada en [research](research.md), con decisiones y alternativas sustentadas. Fase 1 completada en [modelo](data-model.md), contratos públicos/privados y [quickstart](quickstart.md); puertas revisadas tras el diseño. La implementación y sus verificaciones están registradas en [tasks.md](tasks.md) y [validation.md](validation.md); el cierre total permanece pendiente del arranque de producción rechazado por el entorno.

| Requisitos | Diseño | Validación prevista |
| --- | --- | --- |
| FR-001–FR-004 | Dinero compartido y consulta de catálogo/detalle (US1); el agregado pertenece a FR-005/US2. | Formato, consulta, filtros y SC-001/SC-004/SC-006. |
| FR-005–FR-009 | Estado del pedido, persistencia y aritmética en céntimos. | Repetición, mínimo, quitar, recargar y total del ejemplo. |
| FR-010–FR-013 | Resumen sin persistencia y relectura consistente del catálogo. | Mensaje, retiradas, vacío y cero datos personales. |
| FR-014–FR-015, FR-020 | Token opaco en cookie de sesión, hash en SQLite y autorización en cada ruta privada. | SC-005 desde la app; atributos y reproducción de token revocado como pruebas técnicas del contrato; reapertura con/sin restauración por separado. |
| FR-016–FR-019, FR-021 | Validación, foto decodificada e INSERT/DELETE atómicos. | Archivos válidos/corruptos/límites, cancelar, retirar y reiniciar. |
| FR-022–FR-024 | Estados de error/carga y contrato de UI. | Reintentos, teclado, foco, barras fijas y seis referencias. |

## Complexity Tracking

Sin excepciones a la constitución. La elección del almacenamiento, la autorización y el tratamiento de imágenes son medios técnicos de los requisitos existentes. D1 se resolvió por decisión explícita del usuario y no requiere complejidad adicional.
