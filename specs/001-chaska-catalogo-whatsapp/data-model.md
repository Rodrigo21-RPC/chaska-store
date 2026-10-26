# Modelo de datos: Chaska Store

Fecha: 2026-10-26. Fuente: [spec](spec.md). Contratos: [catálogo y pedido](contracts/catalog-order.md), [pantallas](contracts/ui.md).

## Producto persistente

Una tabla `products` en SQLite; cada alta crea una identidad nueva. No hay relación con compradores ni pedidos persistentes.

| Campo | Tipo lógico / almacenamiento | Regla |
| --- | --- | --- |
| `id` | UUID / TEXT, clave primaria | Generado por servidor, inmutable y nunca reutilizado. |
| `name` | Texto / TEXT | Obligatorio; recortar extremos; no aceptar solo espacios; máximo inclusivo de 200 caracteres Unicode (puntos de código), sin truncar. No es único: productos con nombres iguales siguen siendo artículos distintos. |
| `category` | Enumeración / TEXT | Solo Celulares, Laptops o Accesorios; validar también en la base. |
| `priceCents` | Entero / INTEGER | Mayor que cero y entero seguro en JavaScript. Procede de precio en soles con máximo dos decimales. |
| `description` | Texto / TEXT | Obligatorio y no compuesto solo por espacios; conservar párrafos; máximo inclusivo de 5000 caracteres Unicode después de trim, sin truncar. |
| `specifications` | Texto / TEXT | Obligatorio y no compuesto solo por espacios; conservar saltos de línea; máximo inclusivo de 5000 caracteres Unicode después de trim, sin truncar. |
| `photo` | Imagen / BLOB | Una imagen normalizada WebP, después de decodificar un archivo JPG, PNG o WebP válido de hasta 5 000 000 bytes. |
| `createdAt` | Fecha UTC / TEXT | Generada por servidor, usada para orden estable. No editable desde la interfaz. |

`photoUrl` es derivado de `id`; no se almacena una URL externa ni un nombre de archivo del usuario. La extensión, el nombre y el MIME enviado no sustituyen la comprobación del formato real. La decodificación completa debe fallar ante archivos corruptos.

Los límites de transporte son distintos del recuento de caracteres: JSON 65 536 bytes UTF-8, campo multipart 20 000 bytes UTF-8 y cuerpo multipart 5 100 000 bytes, todos inclusivos. El archivo original conserva el máximo de 5 000 000 bytes. Errores y pruebas de frontera: [contrato administrativo](contracts/admin.md).

### Precio y cálculos

- El formulario envía `price` como cadena decimal en soles; aceptar punto o coma como separador decimal, sin separador de miles; convertir exactamente por partes, sin multiplicar un flotante monetario.
- Rechazar cero, negativos, más de dos decimales, notación exponencial, NaN e infinitos. Normalizar a céntimos antes de persistir.
- Subtotal = `priceCents × quantity`; total = suma de subtotales. Validar `Number.isSafeInteger` en cada operación y mostrar error si se excede la representación segura, sin truncar ni redondear cantidades.
- Un formateador compartido presenta siempre `S/` y dos decimales. Los contratos intercambian enteros, no textos ya formateados.

### Ciclo de vida

`Formulario sin guardar → validación y decodificación → INSERT confirmado → publicado`.

Cancelar o fallar la validación no crea filas. Guardar imagen y campos en una sola fila evita productos parciales y archivos huérfanos. Se deshabilita el envío del formulario mientras está en curso para no duplicar un alta por pulsaciones repetidas.

`Publicado → confirmación de retirada → DELETE confirmado → no disponible`.

Cancelar conserva la fila. El borrado físico retira también la foto; no hay papelera, edición ni estado de stock. Un nuevo producto con nombre igual recibe otro `id`. Una retirada concurrente del mismo producto es idempotente desde la interfaz.

## Categoría

Enumeración fija compartida por validación, filtros y formulario; no requiere tabla ni CRUD. “Todos” solo pertenece al estado de consulta.

## Pedido en preparación

No se guarda en SQLite. `localStorage` conserva una versión del pedido en el navegador de ese origen; React mantiene la representación actual en memoria. No se comparte entre dispositivos.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `version` | Entero | `1`; permite detectar estructuras no compatibles. |
| `items` | Lista de líneas | Vacía o una línea por identidad de producto. |

### Línea

| Campo | Tipo | Regla |
| --- | --- | --- |
| `productId` | UUID | Relación lógica con producto; puede quedar obsoleta tras retirarlo. |
| `quantity` | Entero seguro | Mayor o igual a 1; agregar repetido incrementa; restar en 1 conserva 1. |
| `name`, `photoUrl`, `priceCents` | Copia de presentación | No son autoridad para preparar el mensaje; permiten mostrar y nombrar una línea retirada. |

Subtotal, total y contador se derivan, evitando copias contradictorias. El contador suma cantidades. Quitar elimina la línea; quitar la última deja pedido vacío. Revalidar antes del envío reemplaza datos de presentación por los actuales, elimina retirados con aviso y requiere nueva acción del comprador si hubo retiradas.

## Resumen para WhatsApp

Objeto efímero: líneas validadas, total, mensaje y URL. No tiene estado “enviado”, “pagado” o “confirmado”, ni identificador de venta. El servidor no lo persiste. Los importes y nombres proceden de una lectura consistente del catálogo. No contiene dirección, teléfono del comprador u otros datos personales solicitados por la tienda.

## Sesión administrativa persistente

Tabla `admin_sessions`, independiente de productos. No se almacena una cuenta de administrador: la clave proviene de `ADMIN_PASSWORD`.

| Campo | Tipo / almacenamiento | Regla |
| --- | --- | --- |
| `tokenHash` | SHA-256 hexadecimal / TEXT, clave primaria | Hash de un token criptográficamente aleatorio de 32 bytes; el token sin hash solo viaja en cookie HttpOnly. |
| `createdAt` | Fecha UTC / TEXT | Solo dato técnico de creación; no provoca vencimiento. |

Autenticación correcta crea una fila y entrega una cookie nueva. Cada petición privada calcula el hash del token y comprueba que la fila existe. Logout elimina esa fila y borra la cookie; reproducirla no autoriza. Reautenticar con una cookie previa revoca esa sesión y crea otra, sin permitir fijación de sesión.

No existen `expiresAt`, plazo absoluto, vencimiento por inactividad ni TTL oculto. Las filas inaccesibles por eliminación de una cookie pueden permanecer hasta mantenimiento; no deben limpiarse por edad si eso invalida sesiones activas. La persistencia en SQLite permite reiniciar el proceso sin imponer una caducidad accidental. Cerrar el navegador puede eliminar o restaurar su cookie; esta limitación fue aceptada. Ver [contrato administrativo](contracts/admin.md).

## Integridad y almacenamiento

- `DatabaseSync` de `node:sqlite`, preparado contra la API disponible en Node 22.13; consultas parametrizadas, restricciones de campos y transacciones cuando haya más de una mutación relacionada.
- Directorio de datos fuera del código versionado y del sitio estático. Base nueva comienza vacía; datos de demostración se crean en pruebas o mediante la administración, sin sembrado obligatorio de los ejemplos visuales.
- Un proceso y una conexión para el alcance inicial. La persistencia debe usar un volumen/disco durable; un alojamiento que borra su disco al reiniciar no cumple FR-021.
- Pruebas con base temporal aislada y cierre explícito de la conexión. No abrir el puerto de producción al importar la aplicación para supertest.
