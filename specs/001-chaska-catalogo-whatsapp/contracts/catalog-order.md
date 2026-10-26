# Contrato público: catálogo y pedido

Fecha: 2026-10-26. Referencias: [spec](../spec.md), [modelo](../data-model.md).
Contrato propuesto para implementación; todavía no hay servidor ejecutable.

## Convenciones

- Base `/api`; cliente y servidor bajo el mismo origen. JSON UTF-8 salvo la foto.
- Identidades `id`: UUID generados por el servidor; nunca se reutilizan tras retirar productos.
- Dinero: enteros seguros de céntimos (`priceCents`, `subtotalCents`, `totalCents`). Ningún importe se acepta desde el comprador para calcular el resumen.
- Categorías exactas: `Celulares`, `Laptops`, `Accesorios`.
- Error común: `{ "error": { "code": "CODIGO", "message": "Mensaje en español", "fields": {} } }`; `fields` solo aparece si hay errores por campo. Nunca incluir trazas, claves o cookies.
- JSON mal formado o datos inválidos: `400`; recurso inexistente: `404`; tamaño de petición excedido: `413`; fallo temporal: `503`; fallo inesperado: `500` con mensaje genérico.
- El cuerpo JSON de entrada admite hasta 65 536 bytes UTF-8, inclusive, en todas las rutas JSON. Medir bytes reales del cuerpo sin depender solo de `Content-Length`; 65 537 bytes devuelve `413 REQUEST_TOO_LARGE`. Solo se admite cuerpo sin compresión: `Content-Encoding` ausente o `identity`; cualquier otro valor devuelve `415 UNSUPPORTED_ENCODING`. No aplicar este límite de JSON al alta multipart.
- Ante `413`, no truncar, dividir ni reintentar automáticamente la petición. El cliente conserva el pedido o los textos del formulario y muestra un mensaje comprensible; no abre WhatsApp ni confirma cambios.

## Catálogo

| Método y ruta | Respuesta |
| --- | --- |
| `GET /api/products` | `200 { products: ProductSummary[] }`; lista vacía válida. Orden estable: alta más reciente primero, desempate por id. |
| `GET /api/products/:id` | `200 { product: ProductDetail }`; `404 PRODUCT_NOT_FOUND` si fue retirado o no existe. |
| `GET /api/products/:id/photo` | `200 image/webp` con bytes de la imagen normalizada; `404` si el producto ya no existe. |

`ProductSummary`: `id`, `name`, `category`, `priceCents`, `photoUrl`.
`ProductDetail`: los mismos campos más `description` y `specifications` (texto multilínea).
`photoUrl` es relativo al mismo origen; nunca contiene una ruta de disco.

El cliente filtra la lista por nombre con `toLocaleLowerCase('es-PE')` y coincidencia parcial, combinado con la categoría. “Todos” no es una categoría almacenada. Borrar la búsqueda conserva la categoría. No hay paginación ni ordenamiento elegible en esta versión.

Metadatos JSON del catálogo: `Cache-Control: no-store` para que una recarga vuelva a consultar productos. La foto puede usar ETag y revalidación; una imagen en caché no autoriza a pedir un producto retirado.

## Validación y preparación del mensaje

`POST /api/order/preview`, JSON:

```json
{
  "items": [
    { "productId": "11111111-1111-4111-8111-111111111111", "quantity": 1 },
    { "productId": "22222222-2222-4222-8222-222222222222", "quantity": 2 }
  ]
}
```

- Rechazar lista vacía, identificadores inválidos/repetidos, cantidades no enteras positivas y operaciones monetarias que excedan los enteros seguros. No convertir silenciosamente `1.5`, cero o números negativos.
- Leer los productos actuales en una sola operación consistente y calcular todos los importes en el servidor.
- Este endpoint no crea ni almacena un pedido, no reserva existencias y no envía mensajes.
- Respuesta normal `200`: `{ items: OrderLine[], totalCents, message, whatsappUrl }`.
- `OrderLine`: `productId`, `name`, `photoUrl`, `priceCents`, `quantity`, `subtotalCents`.
- `whatsappUrl`: `https://wa.me/<WHATSAPP_NUMBER>?text=<mensaje codificado>`; número internacional solo con dígitos. `message` usa saltos de línea y montos con `S/` y dos decimales.

Ejemplo de mensaje, con productos ficticios:

```text
Hola, Chaska Store. Quiero coordinar este pedido:
1 × Celular de prueba — S/ 4299.00 c/u — Subtotal S/ 4299.00
2 × Accesorio de prueba — S/ 329.00 c/u — Subtotal S/ 658.00
Total: S/ 4957.00
```

Si falta algún producto: `409 PRODUCTS_UNAVAILABLE`, con `removedProductIds`, `items` válidos actualizados y `totalCents`, sin `whatsappUrl`. El cliente conserva los nombres de las líneas retiradas para informar al comprador, elimina esas líneas y solicita una nueva pulsación de enviar. Si no queda ninguna, muestra el pedido vacío. Los productos retirados no se sustituyen por otros de nombre igual.

Si la configuración de WhatsApp es inválida o falta: `503 WHATSAPP_UNAVAILABLE`; el cliente conserva todas las líneas. Si falla la consulta, tampoco modifica el pedido ni abre WhatsApp. La comprobación es una instantánea: no garantiza disponibilidad posterior a abrir la conversación.

El cliente guarda el pedido antes de navegar con `window.location.assign(whatsappUrl)` en la misma pestaña, evitando ventanas emergentes bloqueadas después de una consulta asíncrona. Volver a la tienda conserva la selección. La página no puede confirmar si WhatsApp se abrió o si el comprador envió el mensaje.

## Persistencia del pedido en el navegador

Clave versionada `chaska.order.v1` en `localStorage`; contiene `version: 1` e `items` con `productId`, `quantity` y copia de `name`, `photoUrl`, `priceCents`. La copia solo permite mostrar el pedido y nombrar retiradas; el servidor recalcula desde el catálogo al preparar el mensaje.

Validar la estructura al restaurar; datos corruptos se descartan con aviso. Si no se puede escribir en el almacenamiento, conservar el pedido en memoria e informar que podría perderse al recargar; no mostrar una confirmación falsa de persistencia. Las pruebas de conservación usan un navegador con almacenamiento habilitado. Nunca guardar clave ni token de administrador junto al pedido.
