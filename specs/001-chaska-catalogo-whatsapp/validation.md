# Validación de implementación — Chaska Store

Implementación en curso. Ninguna casilla o resultado pendiente se considera aprobado automáticamente.

## Decisiones menores

- Trabajo en la rama y carpeta actuales para conservar los artefactos sin commit. No se crean commits ni se publica la aplicación.
- jsdom 26.1 se fija para conservar compatibilidad con Node 22.13; el lockfile congela las demás dependencias estables del plan.
- `.env.example` deja la clave vacía: copiarlo no habilita una credencial conocida. El número mostrado es ficticio.

## Evidencia rojo/verde

Se añadirán comandos y resultados reales conforme se completen las fases. Los avisos experimentales de `node:sqlite` en los runtimes que los emiten se distinguirán de fallos de pruebas.

## Validación desde la app

Pendiente de implementación y ejecución de los recorridos de quickstart.

### Fundamentos — T001–T014

- `npm install --no-fund --no-audit`: 226 paquetes instalados; lockfile generado. Reintentos transitorios de red, instalación final exitosa.
- `node node_modules/vitest/vitest.mjs run --reporter=dot`: 22 fallos de aserción observados con esqueletos vacíos. Se corrigió antes un conflicto de almacenamiento de pruebas con Node 25; esa falla de infraestructura no contó como rojo de negocio.
- `npm test -- --reporter=dot`: 6 archivos, 22 tests aprobados tras implementar configuración, dinero, esquema, errores de API y navegación.

### US1 — T015–T024

- Rojo: `npm test -- --reporter=dot`: 8 nuevos fallos en catálogo/detalle; 22 tests anteriores verdes. API 404 en vez de 200 y páginas vacías, sin fallos de importación.
- Verde: mismo comando, 9 archivos y 30 tests aprobados. `npm run build` satisfactorio con Vite 8.3.5.
- `node scripts/validate-browser.js`: Edge real aislado, consulta/retorno con filtros en 2520 ms; capturas 360/390/1440 en `data/qa`, sin desbordamiento horizontal. Revisión visual de catálogo y detalle contra 01/02. Los productos son fixtures temporales, no inventario precargado.
- Decisión menor: Playwright 1.55 con Edge instalado se usa solo como herramienta de validación; sin descargar un navegador ni modificar perfiles personales.

### US2 — T025–T038

- Rojo: 19 tests nuevos fallaron; los 30 anteriores permanecieron verdes.
- Verde: `npm test -- --reporter=dot`: 13 archivos, 49 tests aprobados. Compilación de producción aprobada.
- `node scripts/validate-browser.js --order`: Edge comprobó agregado, dos líneas/tres unidades, total S/ 4957.00, recarga y retorno conservando selección. El enlace wa.me se interceptó localmente sin contactar a WhatsApp ni enviar mensajes; texto y total correctos. Recorrido SC-002 en 1801 ms. Capturas de pedido 360/390/1440 sin desbordamiento; revisión visual contra 03.

### US3 — T039–T054

- Rojo: 32 fallos nuevos observados en acceso, fotos, límites, mutaciones y pantallas vacías antes de implementar. Las 49 pruebas anteriores permanecieron aprobadas.
- Verde: suite completa con 17 archivos y 83 tests; una regresión adicional de foco se escribió y falló (el borrador se perdía), luego se corrigió preservando el componente mientras se oculta durante la comprobación. Resultado final de fase: 84 tests aprobados y compilación correcta.
- Se corrigieron dos fixtures que sobrepasaban 20 000 bytes al combinar 5000 emojis y espacios: se aislaron límites de caracteres/bytes sin cambiar los máximos de producto.
- `node scripts/validate-browser.js --admin`: Edge a 1440 px validó clave incorrecta, alta con foto, panel, cancelar retirada, confirmar retirada y rechazo de acceso tras logout. Publicación 1714 ms, retirada 731 ms; capturas 04/05/06 revisadas. Datos en memoria exclusivos de validación.
- Cookies de sesión sin Expires/Max-Age; pruebas técnicas verifican rotación, revocación y rechazo del token anterior, persistencia y ausencia de TTL. La restauración real de cookies depende del navegador, limitación aceptada.
- Decisión menor: máximo de cuatro workers para evitar sobrecarga de procesos jsdom en el equipo; no cambia comportamiento del producto.

## Validación final y decisiones de integración

- Revisión independiente de código realizada en solo lectura. Se hallaron y corrigieron dos casos con regresiones primero en rojo: respuestas tardías 200/409 descartadas si cambia el pedido o se abandona la pantalla; decodificación de PNG válido de 268 960 000 píxeles y menos de 5 MB, sin imponer un límite comercial extra de píxeles. Se conserva decodificación estricta, procesamiento secuencial, salida reducida y autorización previa. El revisor confirmó resueltos ambos hallazgos, sin otros problemas importantes.
- Regresiones adicionales rojo/verde: borrador preservado al volver el foco, almacenamiento cuyo getter lanza SecurityError, retorno de foco al cancelar el diálogo, almacenamiento indisponible con 503 y rutas de producción servidas sin convertir errores API en HTML.
- Mantenimiento: prueba observó una sesión sin revocar con el esqueleto; después `scripts/revoke-sessions.js` pasó y conservó seis productos/fotos. README documenta el procedimiento al cambiar la clave.
- Instalación reproducible con npm ci: 228 paquetes en Node 22.13.0 y Node 24.13.0. En Windows se detuvieron exclusivamente los procesos propios de validación antes de reinstalar, porque las DLL nativas estaban en uso.
- Node 22.13.0: 20 archivos, 95 tests aprobados y compilación Vite aprobada. Node 24.13.0 LTS: los mismos 95 tests y compilación aprobados. Los dos casos de cuerpos fragmentados esperan la escucha del servidor efímero antes de escribir: se corrigió esa condición de arranque del harness, sin cambiar límites del producto.
- `npm run dev`: Vite en 5173 y servidor en 3000 iniciaron correctamente con configuración y base de QA; página HTTP 200 y catálogo nuevo vacío. Las bases de QA están bajo data/qa y no son inventario real.
- Express escucha en 127.0.0.1: decisión menor de exposición mínima, compatible con el proxy HTTPS del mismo alojamiento. No se publicó ni desplegó el sitio.
- Fotos se guardan junto al producto en SQLite; ningún cliente recibe BLOBs en el listado. Los tests de frontera validan 200/201, 5000/5001, 20 000/20 001, 65 536/65 537 y 5 100 000/5 100 001, también cuerpos fragmentados sin Content-Length.

### Recorridos de navegador comprobados

Edge instalado, perfiles temporales aislados, sin mensajes reales ni perfiles personales:

| Comprobación | Resultado observado |
| --- | --- |
| SC-001 | Consulta, filtros, detalle y retorno: 1897 ms en el recorrido integrado; ejecución posterior 1004 ms. |
| SC-002 | Dos productos, tres unidades, total S/ 4957.00; recarga, mensaje interceptado y retorno: 1438 ms. |
| SC-003 | Alta con foto: 2303 ms; cancelar y confirmar retirada: 1429 ms. |
| SC-004 / FR-024 | Compra a 360/390/1440 px: sin desbordamiento; foco de teclado visible y última tarjeta libre de la barra inferior. Administración a 1440 px con las tres referencias. Sin errores JavaScript en estos recorridos. |
| SC-005 | Clave incorrecta, panel sin acceso y acceso posterior a logout: se pide ingreso. Pruebas técnicas separadas verifican revocación contra reproducción del token. |
| SC-006 | Montos en soles con dos decimales; no hay formularios de datos personales o pagos para el comprador. |
| SC-007 | Las acciones de catálogo/pedido/WhatsApp y la explicación de ausencia de pago se comprobaron en la UI y el recorrido reproducible. No se realizó un estudio con participantes ni se atribuyen los tiempos automatizados a personas reales. |
| Sesión al reabrir Edge | Perfil temporal sin --restore-last-session: no conservó acceso. Con --restore-last-session: conservó acceso. En ambos casos, logout lo revocó. |
| Escenario técnico de escala | 100 tarjetas renderizadas y búsqueda a un solo resultado, sin imponer un máximo comercial de catálogo. |

Capturas revisadas: `data/qa/01-catalogo-360.png`, `01-catalogo-390.png`, `01-catalogo-1440.png`, `02-detalle-390.png`, `03-pedido-360.png`, `03-pedido-390.png`, `03-pedido-1440.png`, `04-acceso-1440.png`, `05-panel-1440.png`, `06-agregar-1440.png`. Son QA con fotos sintéticas; no se precargan productos en la tienda nueva.

### Bloqueo del entorno pendiente

El control automático de ejecución rechazó el comando de arranque local `npm start` con NODE_ENV=production, origen HTTPS de prueba, clave ficticia y base desechable, con el único motivo mostrado «blocked by policy». Se intentó una configuración más segura limitada a la interfaz local y volvió a rechazarse. No se solicitaron permisos, no se eludió el rechazo y no se ejecutaron commits.

El servicio del cliente compilado, seis rutas directas, autorización, cookie Secure y persistencia sí están verificados mediante pruebas de producción con servidores locales efímeros. Eso no se presenta como evidencia de haber ejecutado el comando rechazado. T056 permanece pendiente por su comprobación de arranque; T060 permanece pendiente como cierre total de la feature. La implementación y las demás verificaciones están realizadas.
