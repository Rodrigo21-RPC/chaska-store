# Contrato privado: administración y sesión

Fuente: [spec](../spec.md), FR-014–FR-021 y precisión de sesión aceptada el 2026-10-26. Complementa el [contrato público](catalog-order.md).

## Autenticación y autorización

| Método y ruta | Entrada | Resultado |
| --- | --- | --- |
| `POST /api/admin/session` | JSON `{ password }` | `200 { authenticated: true }` y cookie nueva si la clave es correcta; `401 INVALID_CREDENTIALS` si es vacía o incorrecta. |
| `GET /api/admin/session` | Cookie | `200 { authenticated: true }` si la sesión existe; `401 AUTH_REQUIRED` en otro caso. |
| `DELETE /api/admin/session` | Cookie | Revoca la sesión presentada y borra la cookie; `204`, incluso si ya no existe. |
| `GET /api/admin/products` | Cookie válida | `200 { products: ProductSummary[] }`; lista vacía válida. |
| `POST /api/admin/products` | Cookie válida y multipart | `201 { product: ProductDetail }`, `Location: /api/products/:id`. |
| `DELETE /api/admin/products/:id` | Cookie válida | `204`; también si otro retiro ya eliminó el mismo UUID válido. |

Toda ruta privada salvo login y logout requiere sesión; no se permite el alta o retirada invocando directamente la API. Las respuestas privadas usan `Cache-Control: no-store`. Tras navegar atrás, el cliente consulta la sesión y no expone datos administrativos en caché como prueba de autorización.

### Política de cookie y revocación

- Cookie `chaska_admin`: token opaco aleatorio de 32 bytes; `HttpOnly`, `SameSite=Strict`, `Path=/`, `Secure` en producción HTTPS, sin `Expires` ni `Max-Age` al crearla. Nunca incluye clave ni información de productos.
- Persistir únicamente SHA-256 del token en `admin_sessions`. Tras login correcto, generar un token nuevo y revocar la sesión presentada anteriormente si existía; comparar la clave mediante hashes de longitud fija y comparación de tiempo constante.
- No TTL ni vencimiento por inactividad/horas en cookie o tabla. No usar `localStorage` o `sessionStorage` para autenticar.
- Logout elimina la fila y responde una cookie vacía con vencimiento inmediato y mismos nombre/ruta/atributos. Una copia del token anterior debe recibir `401`, aunque el navegador la restaure o una petición la reproduzca.
- El navegador controla la duración de su sesión y puede restaurar la cookie. La aplicación no intenta detectar cierre mediante `beforeunload` ni promete revocación universal al cerrar el navegador. La aceptación del usuario está registrada en la spec.

## Protección de peticiones

- Cliente y API usan un solo origen. Validar `Origin` igual a `APP_ORIGIN` en login, alta, retirada y logout; origen ajeno o ausente: `403 ORIGIN_NOT_ALLOWED`. El cliente normal utiliza `fetch`; las pruebas de mutaciones incluyen ese encabezado explícito. No habilitar CORS permisivo.
- Autenticar y comprobar origen antes de procesar multipart. Aplicar los límites inclusivos de JSON (65 536 bytes UTF-8) del contrato público y los límites multipart de este contrato; comprobar bytes recibidos también cuando falta `Content-Length`. Los errores no incluyen clave, token, foto completa ni trazas.
- El cliente solo navega al panel tras una respuesta válida. En `401` desde cualquier ruta privada oculta contenido privado y lleva al acceso; mantiene los textos del formulario en memoria cuando sea posible, sin persistirlos como autorización.
- No registrar cuerpos de login ni cookies en logs. El único secreto funcional es `ADMIN_PASSWORD`, obligatorio desde entorno; no hay credencial por defecto ni ruta para cambiarla desde la app. Si el operador cambia la clave, el procedimiento de despliegue debe revocar las sesiones existentes.

## Alta multipart

Campos únicos `name`, `category`, `price`, `description`, `specifications`, `photo`. Los primeros cinco son textos y `photo` es un único archivo. Categoría y precio siguen el [modelo](../data-model.md). Todos son obligatorios. Rechazar campos repetidos o ajenos, archivos adicionales y formatos distintos a JPG/PNG/WebP.

### Límites de entrada

| Entrada | Máximo inclusivo | Exceso |
| --- | --- | --- |
| `name` | 200 caracteres Unicode después de trim | `400 VALIDATION_ERROR`, `fields.name`. |
| `description` | 5000 caracteres Unicode después de trim | `400 VALIDATION_ERROR`, `fields.description`. |
| `specifications` | 5000 caracteres Unicode después de trim | `400 VALIDATION_ERROR`, `fields.specifications`. |
| Un campo de texto multipart sin normalizar | 20 000 bytes UTF-8 | `413 FIELD_TOO_LARGE`, con el campo si se conoce. |
| Foto original | 5 000 000 bytes | `413 PHOTO_TOO_LARGE`. |
| Cuerpo multipart completo, incluidos delimitadores y cabeceras de las partes | 5 100 000 bytes | `413 REQUEST_TOO_LARGE`. |
| Campos de texto / archivos / partes totales | 5 / 1 / 6 | `400 INVALID_UPLOAD`. |
| Nombre de un campo multipart | 32 bytes UTF-8 | `400 INVALID_UPLOAD`. |

“Carácter Unicode” significa punto de código, no bytes ni unidades UTF-16; cliente y servidor usan el mismo recuento. Se conserva el contenido interior y sus saltos de línea. `category` solo acepta una de las tres cadenas exactas y `price` la gramática decimal del modelo; no son textos libres. Los campos normalizados deben seguir siendo obligatorios y no vacíos. Ninguna entrada se trunca.

El límite total de 5 100 000 bytes se aplica al flujo real, también sin Content-Length. Con el archivo de 5 000 000 bytes, cinco campos dentro de sus máximos y los delimitadores habituales hay espacio suficiente; si el envoltorio enviado es excesivo también se rechaza. El primer límite detectado determina el error; las pruebas de frontera de cada límite mantienen los demás por debajo de su máximo. Tanto el conjunto de cinco campos en sus máximos como cada valor de frontera válido deben poder publicarse con una foto válida cuando el cuerpo completo cabe.

Validar primero presencia/esquema; comprobar formato real y decodificar la imagen completa; normalizar y guardar campos/foto en una operación atómica. Un error no crea fila ni archivo persistente.

| Error | Respuesta y comportamiento |
| --- | --- |
| Campos vacíos, precio inválido o categoría ajena | `400 VALIDATION_ERROR` con `fields` por nombre. |
| Texto normalizado que supera su máximo de caracteres | `400 VALIDATION_ERROR` con `fields` por nombre; conserva textos válidos. |
| Campo multipart que supera 20 000 bytes | `413 FIELD_TOO_LARGE`. |
| JSON que supera 65 536 bytes o multipart que supera 5 100 000 bytes | `413 REQUEST_TOO_LARGE`. |
| Foto corrupta o formato no admitido | `400 INVALID_PHOTO` con `fields.photo`. |
| Foto mayor a 5 000 000 bytes | `413 PHOTO_TOO_LARGE`. |
| Dos fotos o campo de archivo incorrecto | `400 INVALID_UPLOAD`. |
| Sesión inexistente/revocada | `401 AUTH_REQUIRED`, antes de decodificar o guardar. |
| Almacenamiento temporalmente indisponible | `503 STORAGE_UNAVAILABLE`; no confirmar alta o retirada. |

El navegador deshabilita guardar mientras la petición está en curso. No hay reintento automático de una creación con resultado de red incierto: informar al administrador y permitir revisar el panel antes de decidir repetir, evitando afirmar que la operación falló en servidor si no pudo confirmarse.

La confirmación de retirada es parte del cliente; solo confirmar genera `DELETE`. Cancelar no realiza mutación. El servidor elimina producto y foto juntos; un UUID mal formado recibe `400` y nunca se interpreta como una ruta de archivo o SQL.

## Pruebas mínimas de contrato

Clave correcta/incorrecta/vacía; rutas privadas sin sesión; atributos de cookie y ausencia de vencimiento; conservación tras avance de reloj simulado; token nuevo al autenticar; logout idempotente y rechazo del token revocado; mutaciones de origen ajeno; alta válida y negativa para los tres formatos, corrupción, límite exacto y un byte superior, dos archivos; borrado y repetición de borrado; persistencia al reiniciar.

La reproducción de la cookie anterior al logout es una prueba técnica de FR-020 ejecutada con supertest, no una acción exigida a la persona que valida SC-005. La aceptación desde la app usa clave incorrecta, retorno al panel tras logout y comprobación de que se pide la clave; las dos capas de verificación se complementan.

Probar además 200/201 caracteres de nombre, 5000/5001 en cada texto largo, caracteres multibyte y espacios exteriores; los cinco campos simultáneamente en sus máximos válidos. Verificar 20 000/20 001 bytes por campo, 65 536/65 537 bytes JSON y 5 100 000/5 100 001 bytes multipart, incluidos flujos sin Content-Length. En peticiones válidas de frontera, cumplir todos los demás límites; una respuesta negativa nunca confirma ni crea un producto parcial. La prueba de cuerpo total puede usar campos/cabeceras permitidos y relleno de envoltorio para alcanzar el tamaño exacto sin exceder otra frontera.

Supertest demuestra autorización y revocación del lado servidor. La eliminación/restauración de cookies al cerrar un navegador se comprueba manualmente con configuración registrada, conforme a [quickstart](../quickstart.md).
