# Contrato de pantallas y accesibilidad

Referencias: [spec](../spec.md), [diseños validados](../../../docs/diseno/).
Son seis pantallas; los avisos y la confirmación de retirada son estados de estas pantallas.

La aceptación se divide por historia: US1 comprueba consulta, búsqueda, filtros, detalle y retorno; US2 comprueba presencia y funcionamiento de “Agregar al pedido” desde catálogo y detalle, contador y pedido. Las referencias muestran el producto final integrado; la demostración aislada de US1 no declara completada la aceptación de US2.

| Ruta | Pantalla y acciones | Referencia |
| --- | --- | --- |
| `/` | Catálogo: búsqueda por nombre, cuatro filtros, tarjetas y contador; foto/nombre abren detalle; agregar conserva la pantalla. Acceso “Administración” identificado con texto. | 01 |
| `/productos/:id` | Detalle: volver, foto, categoría, nombre, precio, descripción completa, especificaciones multilínea y agregar. | 02 |
| `/mi-pedido` | Líneas con precio unitario, cantidades, subtotal y quitar; total, botón verde y aviso de ausencia de pago. Vacío con acceso al catálogo. | 03 |
| `/admin/acceso` | Tarjeta centrada: título, campo “Clave del administrador” de tipo contraseña y botón “Ingresar”; error sin revelar credenciales. | 04 |
| `/admin` | Panel con tabla Foto/Nombre/Categoría/Precio/Acción; agregar, quitar con confirmación nombrada y cerrar sesión. | 05 |
| `/admin/productos/nuevo` | Nombre, categoría, precio en soles, descripción, especificaciones y una foto; cancelar y guardar. | 06 |

La imagen 04 está recortada; sus campos proceden de la spec. El nombre visible será Chaska Store. No se incorporan las funciones genéricas de los documentos DESIGN que quedaron fuera del alcance.

## Estados y navegación

- Cada consulta distingue cargando, lista/contenido, vacío y error con reintento. No mostrar “sin productos” mientras se carga o cuando falla una consulta.
- Deshabilitar guardar durante una subida y enviar durante la preparación del mensaje; avisar si falla. No borrar los textos del formulario ante un error. Si el navegador no conserva el archivo tras un error, pedir seleccionarlo otra vez de forma explícita.
- Mostrar los máximos de nombre (200 caracteres Unicode) y descripción/especificaciones (5000 cada una), validar con el mismo recuento que el servidor y no truncar silenciosamente. Los errores `400` por campo y `413` por tamaño mantienen textos válidos o pedido; no confirman guardado ni abren WhatsApp. Límites de bytes y fronteras: [contrato administrativo](admin.md).
- Mantener búsqueda y categoría al volver del detalle durante la navegación; el pedido persiste según [contrato público](catalog-order.md).
- El contador es la suma de unidades. El control menos queda deshabilitado en 1. Eliminar la última línea muestra el estado vacío.
- La confirmación de retirada tiene nombre del producto, “Cancelar” y “Quitar”. Cancelar no llama al servidor. Tras confirmar, actualizar lista solo cuando el servidor confirma; si falla, conservar la fila.
- Las rutas privadas comprueban acceso con el servidor al entrar; la API vuelve a autorizar cada consulta o mutación. Ante `401`, ocultar datos privados y mostrar acceso; una ruta protegida de React no sustituye la autorización.
- No ocultar descripción o especificaciones con truncamiento permanente. Especificaciones se representan como texto con saltos de línea; no se intenta deducir campos de tablas.

## Presentación y comprobaciones

- Fondo oscuro, superficies redondeadas, azul para acciones principales, verde para WhatsApp y rojo para retirar; tipografía y espaciado guiados por las seis imágenes.
- Compras: comprobar 360, 390 y 1440 px de ancho. Administración: referencia y aceptación a 1440 px. No se promete un diseño administrativo móvil adicional.
- Catálogo de dos columnas en móvil cuando quepa; navegación inferior Catálogo/Mi pedido y botón de agregar accesible en el detalle. Reservar espacio para barras fijas y zona segura.
- Precios y sumas comparten un único formateador que garantiza `S/` y dos decimales. No depender de que el formato monetario predeterminado de la plataforma coincida exactamente.
- Usar botones y enlaces reales, etiquetas asociadas, textos alternativos para fotos, nombres accesibles para más/menos y foco visible. Errores vinculados al campo y confirmaciones anunciables con una región de estado.
- La confirmación de retirada debe permitir teclado, devolver foco al cancelar y no dejar foco detrás del diálogo. La selección de categoría y la carga de archivo deben poder usarse sin ratón.
- Ningún control fijo tapa la última línea ni acciones; la foto de reemplazo no oculta nombre ni precio. Evitar que el texto largo cause desplazamiento horizontal.

Los recorridos manuales y los criterios de éxito están en [quickstart](../quickstart.md). Esta documentación define comportamiento previsto, no resultados de pruebas ya ejecutadas.
