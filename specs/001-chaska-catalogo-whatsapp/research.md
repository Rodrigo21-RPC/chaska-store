# Investigación y decisiones técnicas

Fecha: 2026-10-26. Base: [spec](spec.md), [constitución](../../.specify/memory/constitution.md) y stack de [AGENTS.md](../../AGENTS.md).

## R1 — Versiones y ejecución

**Decisión**: JavaScript ESM, Node >=22.13.0; recomendar una versión LTS compatible de las ramas 22 o 24. Baseline: React 19, Vite 8 con plugin-react 6, Tailwind 4 con `@tailwindcss/vite`, Express 5, Zod 4, Vitest 4.1.12 y supertest 7. Congelar versiones exactas mediante `package-lock.json` durante implementación; no instalar etiquetas beta ni depender de `latest` sin verificar compatibilidad.

**Razón**: Node 22.13 permite `node:sqlite` sin el indicador experimental. Vite y Vitest seleccionados admiten ese mínimo. El entorno observado usa Node 25.2.1; la línea Vitest 4.1 cubre también ese entorno. La comprobación en el mínimo 22.13 debe realizarse durante implementación: aquí no se instalaron dependencias ni se ejecutó la aplicación.

**Alternativas**: Vite 7/plugin-react 5 también es viable; no se necesita cambiar de stack ni elevar el mínimo. No usar automáticamente Vitest 5: su compatibilidad de motores puede excluir Node 25. Usar únicamente la superficie SQLite de Node 22.13, sin opciones añadidas posteriormente.

Fuentes primarias: [Node 22.13](https://nodejs.org/en/blog/release/v22.13.0), [SQLite 22.13](https://nodejs.org/download/release/v22.13.0/docs/api/sqlite.html), [Vite](https://vite.dev/guide/), [plugin oficial React](https://raw.githubusercontent.com/vitejs/vite-plugin-react/main/packages/plugin-react/package.json), [React](https://react.dev/versions), [Tailwind/Vite](https://tailwindcss.com/docs/installation/using-vite), [Express](https://expressjs.com/en/starter/installing/), [Zod](https://zod.dev/), [Vitest 4.1.12](https://raw.githubusercontent.com/vitest-dev/vitest/v4.1.12/packages/vitest/package.json), [supertest](https://raw.githubusercontent.com/forwardemail/supertest/master/package.json).

## R2 — Aplicación de un solo origen

**Decisión**: Un paquete raíz con cliente React/Vite y servidor Express; en desarrollo Vite redirige `/api` a Express, y en producción Express sirve `dist/client` y la API bajo el mismo origen. React Router para las seis rutas; Context/reducer para pedido y estado local para formularios y filtros.

**Razón**: Evita CORS, despliegues separados y servicios auxiliares. Express sirve el historial de rutas del cliente después de resolver `/api`; una API inexistente responde JSON 404, no HTML.

**Alternativas**: Framework de renderizado servidor o múltiples servicios añaden trabajo que no exige la spec. Redux y una capa de caché no aportan valor en este alcance.

## R3 — SQLite y fotos en una operación atómica

**Decisión**: `DatabaseSync` con consultas parametrizadas. Datos y foto normalizada como BLOB en una fila `products`; no ORM ni almacén externo de imágenes.

**Razón**: Para un catálogo pequeño, una base durable evita coordinar archivos y filas ante fallos y retiradas. La lista devuelve metadatos y URLs, nunca BLOBs. La lectura síncrona bloquea el proceso durante la operación; mantener consultas pequeñas y no asumir capacidad de grandes cargas.

**Alternativas**: Fotos en disco son viables, pero exigen gestionar coherencia y limpieza de archivos huérfanos. Un servicio de objetos o PostgreSQL no se justifica para esta versión. Esta elección es una inferencia de simplicidad, no una recomendación universal para catálogos grandes.

Fuente primaria: [API SQLite de Node 22.13](https://nodejs.org/download/release/v22.13.0/docs/api/sqlite.html).

## R4 — Subida y validación de la foto

**Decisión**: Multer 2 en la ruta de alta, después de autenticar; un archivo en memoria con límite de 5 000 000 bytes y campos de formulario acotados. Sharp decodifica realmente JPG/PNG/WebP y normaliza a una imagen WebP estática, orientada y de hasta 1600 px por lado sin ampliar, retirando metadatos. Comprobar formato real y forzar la decodificación antes de confirmar el producto. No aceptar SVG/GIF ni confiar en el nombre/MIME del cliente.

**Razón**: Zod valida campos, pero no demuestra que una imagen no esté corrupta. Normalizar reduce tamaño y elimina contenido accesorio antes de servir bytes con MIME conocido. El límite de 5 MB se interpreta decimalmente; no se introduce otro máximo de píxeles comercial sin aprobación. Conservar las protecciones estándar del decodificador y mapear fallos a un error de foto comprensible.

**Alternativas**: Inspeccionar solo la firma no prueba una imagen completa; guardar archivos originales requiere más precauciones al servirlos. No se añade antivirus ni un servicio de subida.

Fuentes primarias: [Multer](https://expressjs.com/en/resources/middleware/multer/), [Sharp: constructor](https://sharp.pixelplumbing.com/api-constructor/), [Sharp: salida](https://sharp.pixelplumbing.com/api-output/), [OWASP: subida de archivos](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## R5 — Pedido local y dinero exacto

**Decisión**: Guardar líneas versionadas en `localStorage`, sin datos personales ni credenciales. Persistir identidad, cantidad y copia de presentación; calcular en enteros de céntimos y revalidar el catálogo en el servidor antes de abrir WhatsApp.

**Razón**: Cumple conservación al recargar y regresar; el pedido no es una venta ni requiere tabla de pedidos. El servidor no confía en precios del navegador y elimina retirados con revisión explícita del comprador.

**Alternativas**: Solo memoria pierde el pedido al recargar; `sessionStorage` no cubre igual la reapertura de pestañas; cuentas y pedidos en servidor ampliarían el producto.

Fuente primaria: [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). La decisión de arquitectura y el uso de céntimos son inferencias de los requisitos FR-005–FR-013.

## R6 — WhatsApp sin envío automático

**Decisión**: Preparar `https://wa.me/<numero>?text=<texto codificado>` desde el servidor tras validar las líneas. Número internacional solo con dígitos, desde `WHATSAPP_NUMBER`. Navegar en la misma pestaña al resultado para evitar bloqueadores de ventanas emergentes.

**Razón**: Click to chat prepara una conversación; enviar requiere la acción del comprador en WhatsApp. No se necesita API empresarial, webhook, bot ni confirmación de entrega. El número de contacto será visible en el enlace por su propia función, pero se configura fuera del código.

**Alternativas**: Enviar mensajes por API introduciría credenciales y comportamientos no solicitados. No dividir ni recortar silenciosamente pedidos largos; los fallos detectables conservan el pedido y muestran un aviso.

Fuente primaria: [WhatsApp: click to chat](https://faq.whatsapp.com/5913398998672934).

## R7 — Pruebas y fidelidad visual

**Decisión**: Vitest para reglas y componentes; supertest con base temporal para contratos y autorización; React Testing Library y jsdom para interacción. Cada regla comienza con una prueba ejecutada en rojo. Los siete criterios de éxito tienen recorridos manuales en quickstart, incluidos tiempos y tamaños de pantalla.

**Razón**: Las pruebas de API no prueban ni el comportamiento real del navegador al cerrarse ni que se envió un mensaje. Los diseños validados definen composición; contrastarlos durante implementación, con especial atención al recorte de la imagen 04 y a la marca correcta.

**Alternativas**: Una suite completa de navegador automatizado puede agregarse si surge una necesidad concreta, pero no es requisito para este primer diseño. Las verificaciones de interacción y las comprobaciones manuales cubren la aceptación prevista.

Fuentes primarias: [Vitest 4.1.12](https://raw.githubusercontent.com/vitest-dev/vitest/v4.1.12/packages/vitest/package.json), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Compatibilidad de estilo: [Tailwind](https://tailwindcss.com/docs/compatibility), para navegadores modernos; no se exige compatibilidad con navegadores antiguos.

## R8 — Sesión administrativa y limitación aceptada

**Decisión**: Token opaco aleatorio en cookie de sesión HttpOnly/SameSite=Strict/Secure en producción, sin Expires ni Max-Age; tabla SQLite de hashes de tokens revocables sin TTL. El usuario aceptó expresamente que el navegador pueda restaurar la cookie y que “Cerrar sesión” revoque el acceso en el servidor. La precisión está integrada en FR-020 y SC-005. Revocar la fila y borrar la cookie al salir; comprobar que una copia del token anterior ya no autoriza.

**Razón**: Conserva acceso al recargar y reabrir pestañas y respeta la decisión de no añadir vencimiento temporal. Algunos navegadores restauran cookies de sesión al reabrirse: el servidor no recibe una señal fiable de cierre completo. Las pruebas de navegador registrarán esa configuración, sin prometer cierre universal.

**Alternativas**: `sessionStorage` pierde acceso al cerrar pestañas; `beforeunload` también se dispara al navegar y no se ejecuta de manera fiable en todos los cierres. Cookie con todo el estado firmado dificulta la revocación contra reproducción. `express-session` con almacén propio sería viable, pero añade una interfaz de almacén para un único tipo de sesión; se elige un módulo reducido con tokens, consultas parametrizadas y pruebas de revocación. No usar MemoryStore en producción.

**Seguridad**: Validar origen en mutaciones, no guardar tokens en almacenamiento accesible al cliente, no incluir cuerpos de login en logs, y autorización del servidor en cada operación. La ausencia de timeout es una decisión explícita de producto; no aplicar silenciosamente los plazos de la recomendación general OWASP. HTTPS y cierre de sesión son necesarios para operar la administración.

Fuentes primarias: [MDN: Set-Cookie y restauración](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [MDN: beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event), [Express: sesiones](https://expressjs.com/en/resources/middleware/session/), [Express: cookie-session y reproducción](https://expressjs.com/en/resources/middleware/cookie-session/), [OWASP: gestión de sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Resultado de fase 0

Resueltas las decisiones de versiones, ejecución, persistencia, fotos, dinero, pedido, WhatsApp, pruebas y sesión. La discrepancia D1 queda cerrada por aceptación explícita del usuario, incorporada a la spec; no quedan aclaraciones técnicas abiertas para la fase 1.
