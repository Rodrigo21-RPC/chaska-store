# Guía de ejecución y validación

Esta guía describe cómo ejecutar y validar la implementación. Los resultados efectivamente comprobados y sus límites se registran en [validation.md](validation.md).

Referencias: [plan](plan.md), [modelo](data-model.md), [catálogo/pedido](contracts/catalog-order.md), [administración](contracts/admin.md), [pantallas](contracts/ui.md).

## Preparación prevista

1. Usar Node >=22.13.0 y npm; preferentemente Node LTS 22 o 24. Confirmar con `node --version` y `npm --version`.
2. Desde la raíz, ejecutar:

```powershell
npm install
Copy-Item -LiteralPath .env.example -Destination .env
```

3. Editar `.env` localmente. Nunca copiar claves reales a documentación, pruebas ni repositorio. `.env.example` tendrá ejemplos sin secretos reales para:

| Variable | Uso y valor orientativo |
| --- | --- |
| `ADMIN_PASSWORD` | Clave administrativa, obligatoria, sin valor predeterminado utilizable. Ejemplo: `cambiar-por-una-clave-larga`. |
| `WHATSAPP_NUMBER` | Contacto internacional solo con dígitos. Ejemplo ficticio: `51900000000`. Debe reemplazarse por el contacto real para validar la apertura. |
| `DATABASE_PATH` | Archivo durable; ejemplo `./data/chaska.sqlite`. |
| `PORT` | Puerto Express; ejemplo `3000`. |
| `APP_ORIGIN` | Origen visible al usuario; en desarrollo `http://localhost:5173`; en producción el origen HTTPS real. |
| `NODE_ENV` | `development` local; `production` al iniciar el sitio compilado. |

La clave ausente impide iniciar para no abrir una administración insegura. El número ausente o inválido deja explorar y preparar el pedido, pero el intento de abrir WhatsApp muestra indisponibilidad y conserva las líneas. La configuración se lee en el servidor, sin prefijo `VITE_` para claves.

## Comandos de ejecución

```powershell
npm run dev
```

Inicia Vite en `http://localhost:5173` y Express en `http://localhost:3000`. Vite redirige `/api`; utilizar el origen de Vite para el recorrido. No mezclar `localhost` y `127.0.0.1` porque son orígenes distintos.

```powershell
npm test
npm run build
```

El primero ejecuta Vitest una vez y termina; supertest usa una base temporal aislada, no la base real. El segundo compila el cliente. Para verificar compatibilidad, repetir instalación y pruebas en el mínimo Node 22.13.0 y en el LTS escogido durante implementación; Node 25 local no demuestra por sí solo esa compatibilidad.

Producción, tras compilar: configurar `NODE_ENV=production` y `APP_ORIGIN` con HTTPS, ejecutar `npm start` y acceder a ese origen. Express sirve el cliente compilado y la API. La terminación HTTPS puede ocurrir en un proxy; el archivo SQLite debe vivir en disco durable y quedar fuera de `dist`. Para comprobar persistencia, detener y volver a iniciar con el mismo `DATABASE_PATH`; no usar `:memory:` en producción.

## Preparar datos desde la app

Ingresar por “Administración” con la clave de `.env`. Crear seis productos de prueba repartidos entre las tres categorías con fotos válidas, descripción y especificaciones. Incluir un celular de S/ 4299.00 y un accesorio de S/ 329.00. No son un inventario inicial obligatorio; permiten repetir los criterios de éxito.

## Recorridos observables

| Criterio | Acción | Resultado esperado |
| --- | --- | --- |
| SC-001 | Sin ayuda, iniciar cronómetro, filtrar categoría, buscar parte de un nombre y abrir detalle. | Menos de 1 minuto; nombre, categoría, precio, foto, descripción completa y especificaciones correctos; sin registro. |
| SC-002 | Agregar el celular una vez y el accesorio dos veces; abrir “Mi pedido”, probar menos y más y preparar WhatsApp. | Menos de 2 minutos; contador 3, dos líneas, total S/ 4957.00. Conversación correcta y texto con cantidades, unitarios y subtotales. No es necesario enviar el mensaje para validar. |
| SC-003 | Con textos/foto listos, acceder y guardar un producto; comprobar catálogo, recargar y retirar con confirmación. | Publicar en menos de 3 minutos y retirar en menos de 1; cancelar conserva el producto y confirmar lo retira, aun tras recargar/reiniciar el servidor. |
| SC-004 | Comparar compra a 360/390/1440 px y administración a 1440 px con las seis imágenes. Recorrer contenido hasta el final. | Sin desplazamiento horizontal ni controles tapados; tema, jerarquía y acciones de las referencias, marca Chaska Store. |
| SC-005 | Intentar acceso privado sin sesión, usar clave incorrecta, cerrar sesión e intentar volver atrás. Intentar guardar datos inválidos y cancelar una retirada. | Siempre se impide administrar sin autorización; las operaciones inválidas/canceladas no cambian el catálogo. Complementar con la comprobación de sesión descrita en el plan. |
| SC-006 | Recorrer las seis pantallas y leer el mensaje preparado. | Todos los montos en soles con dos decimales; ningún registro, dato personal ni pago solicitado al comprador. |
| SC-007 | Pedir a una persona no técnica que muestre cómo volver al catálogo, revisar su pedido y coordinar por WhatsApp. | Identifica las tres acciones y explica que abrir el mensaje no confirma ni paga la compra. |

## Casos negativos y persistencia

- Agregar desde catálogo y detalle: un mismo producto ocupa una línea y suma cantidad. Restar en 1 conserva 1; quitar la última línea deja vacío e impide enviar.
- Recargar, ir al detalle y regresar de WhatsApp: conservar selección. En una sesión de navegador con almacenamiento bloqueado, informar si no es posible conservar tras recarga; nunca perder silenciosamente un pedido por un fallo detectable.
- Con el pedido abierto, retirar uno de sus productos desde administración en otra pestaña; intentar enviar: aviso con nombre, eliminación de esa línea, total actualizado y nueva pulsación necesaria. Abrir la dirección del producto retirado: estado no disponible.
- Probar catálogo vacío, categoría sin coincidencias y fallo de red: mensajes distintos, filtros limpiables y reintento cuando corresponda. No confirmar operaciones que fallaron.
- Crear fotos reales JPG, PNG y WebP válidas; comprobar formato corrupto, SVG/GIF, archivo que supera 5 000 000 bytes, dos archivos y MIME declarado falso. Ninguno de los inválidos crea un producto parcial. Las pruebas automáticas incluyen el límite exacto y un byte superior.
- Intentar guardar con textos en blanco, categoría ajena a las tres opciones, cero, negativo y más de dos decimales. Comprobar nombre de 200 caracteres admitido y 201 rechazado, y descripción/especificaciones de 5000 admitidas y 5001 rechazadas, después de recortar extremos y sin truncar. Debe indicarse qué corregir y conservar los textos válidos. Pulsar guardar repetidamente durante la subida no duplica productos.
- Revisar navegación por teclado, etiquetas, foco y cierre/cancelación del diálogo de retirada. Las barras inferiores no tapan la última fila ni la acción de enviar.

## Validación de sesión administrativa

1. Ingresar, recargar y cerrar/reabrir solo la pestaña manteniendo el navegador abierto: conservar acceso sin pedir clave. No existe vencimiento por horas ni inactividad.
2. Cerrar completamente el navegador y reabrirlo con restauración de sesión desactivada: si eliminó la cookie, se exige la clave. Repetir con restauración activada: se acepta que el navegador conserve el acceso. Registrar navegador, versión, configuración y resultado observado.
3. Pulsar “Cerrar sesión” y volver atrás o intentar administrar desde otra pestaña: la siguiente comprobación del servidor debe denegar acceso. Esta es la aceptación visible de SC-005. Por separado, la prueba técnica del contrato/FR-020 debe reproducir una copia de la cookie anterior y obtener `401`; no se pide hacerlo a la persona que valida la app.
4. Como verificación técnica separada de SC-005, comprobar automáticamente atributos HttpOnly/SameSite/Secure según entorno, ausencia de Expires/Max-Age al crear sesión, token nuevo al autenticar, persistencia después de reiniciar y conservación al adelantar el reloj simulado. Supertest no demuestra el comportamiento del cierre real de un navegador.

La restauración de cookies es una limitación aceptada en la spec; cerrar el navegador no sustituye “Cerrar sesión” como revocación fiable. Al cambiar la clave por mantenimiento, detener la aplicación, actualizar `.env` y ejecutar `npm run revoke-sessions` con DATABASE_PATH apuntando al archivo correcto; el comando revoca únicamente `admin_sessions` sin alterar `products`. Reiniciar después la aplicación. No registrar tokens o claves como evidencia de pruebas.

## Evidencia para cerrar la feature

Durante implementación registrar pruebas de negocio ejecutadas primero en rojo y luego en verde; exigir `npm test` satisfactorio antes de cerrar. Registrar además resultado de compilación, recorridos SC-001–SC-007, navegador/configuración de sesión usados, tamaños revisados y cualquier limitación observada. Consultar los resultados reales en [validation.md](validation.md); la guía no sustituye la evidencia de ejecución.
