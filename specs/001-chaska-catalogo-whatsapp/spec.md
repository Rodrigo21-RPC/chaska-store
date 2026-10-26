# Feature Specification: Chaska Store — catálogo y pedidos por WhatsApp

**Feature Branch**: `001-chaska-catalogo-whatsapp`

**Created**: 2026-10-26

**Status**: Draft — validada para planificación; sin implementar

**Input**: Crear una tienda virtual simple llamada Chaska Store, con catálogo de celulares, laptops y accesorios; el administrador agrega y quita productos y los clientes realizan pedidos vía WhatsApp, sin pagos. Usar las seis imágenes validadas de `docs/diseno`, abiertas y revisadas antes de redactar.

## Clarifications

### Session 2026-10-26

- Q: ¿Cuándo debe caducar el acceso del administrador si olvida cerrar sesión? → A: Opción C: mantener el acceso hasta cerrar el navegador o cerrar sesión, sin caducidad por inactividad ni por horas transcurridas.
- Q: ¿Cómo se interpreta la opción C si el navegador restaura sus cookies de sesión al reabrirse? → A: Usar una cookie de sesión sin vencimiento temporal; se acepta que el navegador pueda restaurarla. “Cerrar sesión” siempre revoca el acceso en el servidor. Esta precisión sustituye la garantía de cierre al terminar cualquier navegador de la respuesta anterior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar el catálogo y consultar un producto (Priority: P1)

Como visitante, quiero encontrar un producto y revisar su información y precio sin registrarme para decidir qué pedir.

**Why this priority**: El catálogo público permite conocer la oferta aun sin preparar un pedido.

**Independent Test**: Con productos de las tres categorías, recorrer el catálogo, buscar un nombre, filtrar por categoría y abrir un detalle.

**Acceptance Scenarios**:

1. **Given** productos publicados, **When** abro el catálogo, **Then** veo foto, nombre y precio en soles por producto, además de búsqueda, categorías y acceso a “Mi pedido”. La aceptación de “Agregar al pedido” pertenece a la historia 2.
2. **Given** productos de distintas categorías, **When** selecciono Celulares, Laptops o Accesorios, **Then** solo veo productos de esa categoría; “Todos” elimina esa restricción.
3. **Given** una categoría seleccionada, **When** busco parte de un nombre, **Then** veo los productos de esa categoría cuyo nombre coincide sin distinguir mayúsculas; al borrar el texto recupero la lista de la categoría.
4. **Given** una foto o nombre de producto, **When** lo selecciono, **Then** veo foto ampliada, nombre, categoría, precio, descripción completa y especificaciones; puedo volver al catálogo conservando búsqueda y categoría. El agregado desde el detalle se acepta en la historia 2.
5. **Given** catálogo sin productos o búsqueda sin coincidencias, **When** consulto la lista, **Then** veo un mensaje que distingue ambos casos; si hay filtros puedo limpiarlos.

---

### User Story 2 - Preparar el pedido y llevarlo a WhatsApp (Priority: P1)

Como comprador, quiero reunir productos, ajustar cantidades y abrir un mensaje con el resumen para coordinar la compra con la tienda.

**Why this priority**: Es el objetivo comercial principal; la tienda no cobra ni confirma la venta dentro de la página.

**Independent Test**: Con productos de prueba de S/ 4299.00 y S/ 329.00, preparar una unidad del primero y dos del segundo y comprobar un total de S/ 4957.00 tanto en “Mi pedido” como en el mensaje de WhatsApp.

**Acceptance Scenarios**:

1. **Given** un pedido vacío, **When** veo el catálogo o un detalle, **Then** encuentro “Agregar al pedido”; al pulsarlo, el producto aparece con cantidad 1 y recibo una confirmación visible sin abandonar la pantalla. Debe comprobarse por separado desde ambas pantallas.
2. **Given** un producto ya agregado, **When** lo agrego de nuevo, **Then** aumenta su cantidad en la misma línea; el contador de “Mi pedido” muestra la suma de unidades.
3. **Given** productos en “Mi pedido”, **When** aumento o disminuyo una cantidad, **Then** se actualizan cantidad, subtotal, total y contador; la cantidad mínima es 1 y “Quitar” elimina la línea.
4. **Given** un pedido no vacío, **When** pulso “Enviar pedido por WhatsApp”, **Then** se abre la conversación con el número de la tienda y un mensaje preparado con nombre, cantidad, precio unitario y subtotal de cada producto, y total en soles; el comprador decide enviarlo en WhatsApp.
5. **Given** que abrí WhatsApp, **When** regreso sin enviar el mensaje, **Then** mi pedido sigue disponible y la tienda no afirma que se envió o confirmó la compra.
6. **Given** que quité el último producto, **When** veo “Mi pedido”, **Then** aparece un estado vacío con acceso al catálogo y no puedo iniciar un envío vacío.
7. **Given** un producto retirado después de agregarlo, **When** intento enviar, **Then** se informa cuál ya no está disponible, se excluye y se recalcula el total; debo revisar y volver a pulsar enviar si quedan productos.

---

### User Story 3 - Administrar los productos con acceso privado (Priority: P2)

Como administrador, quiero acceder con mi clave, agregar un producto y quitarlo del catálogo para mantener la oferta vigente.

**Why this priority**: Permite mantener la tienda sin añadir funciones de gestión ajenas al alcance.

**Independent Test**: Acceder, crear un accesorio con foto y datos completos, comprobarlo en el catálogo, cancelar una retirada y luego confirmarla; verificar que desaparece y cerrar sesión.

**Acceptance Scenarios**:

1. **Given** que no inicié sesión, **When** intento abrir el panel o realizar un alta o retirada, **Then** se exige acceso y no se permite modificar productos; una clave incorrecta muestra un error y una correcta abre el panel.
2. **Given** acceso válido, **When** abro el panel, **Then** veo una tabla con foto, nombre, categoría, precio y “Quitar”, además de “Agregar producto” y “Cerrar sesión”; sin productos veo un estado vacío con la acción de agregar.
3. **Given** el formulario de alta, **When** completo nombre, categoría, precio, descripción, especificaciones y una foto válida y guardo, **Then** se crea un solo producto, vuelvo al panel con confirmación y el producto está disponible en catálogo y detalle.
4. **Given** datos incompletos, precio inválido, texto que supera su máximo o foto no admitida, **When** intento guardar, **Then** no se crea el producto, se indican los campos que debo corregir y se conservan los textos válidos. Un nombre de 200 caracteres y descripción/especificaciones de 5000 cada una son admitidos; 201 o 5001, respectivamente, se rechazan.
5. **Given** un alta sin guardar, **When** pulso “Cancelar”, **Then** regreso al panel sin publicar un producto.
6. **Given** un producto existente, **When** pulso “Quitar”, **Then** se solicita confirmación identificando el producto; cancelar lo conserva y confirmar lo retira del panel y del catálogo.
7. **Given** una sesión iniciada, **When** cierro sesión y vuelvo al panel, incluso mediante el botón de retroceso, **Then** necesito ingresar la clave otra vez para consultar la administración o modificar productos.
8. **Given** un alta o retirada confirmada, **When** recargo y vuelvo a acceder, **Then** el cambio permanece.
9. **Given** una sesión iniciada, **When** recargo, cierro y vuelvo a abrir solo la pestaña o dejo de usar el panel manteniendo abierto el navegador, **Then** conservo el acceso sin volver a ingresar la clave.
10. **Given** una sesión iniciada, **When** cierro completamente el navegador y lo vuelvo a abrir, **Then** el acceso puede continuar si el navegador restaura la sesión. Si antes pulsé “Cerrar sesión”, al intentar volver al panel se solicita nuevamente la clave. Las verificaciones técnicas de revocación están en el contrato administrativo.

### Edge Cases

- Producto retirado: abrir su detalle mediante una dirección anterior muestra “Producto no disponible” y un acceso al catálogo; no permite agregarlo.
- Cantidad inválida: solo se aceptan enteros positivos; restar en 1 no genera cantidades negativas ni elimina implícitamente el producto.
- Foto: se acepta una sola imagen JPG, PNG o WebP de hasta 5 MB; un archivo corrupto, de otro tipo o mayor se rechaza con un mensaje. Si una imagen publicada no carga, aparece un reemplazo sin ocultar nombre ni precio.
- Fallo al cargar o guardar: se explica que la acción no se completó y se ofrece reintentar; no se muestra éxito ni se publica un producto parcial. Repetir el guardado mientras está en curso no crea duplicados.
- WhatsApp no abre o no hay número configurado: se informa el problema cuando pueda detectarse y se conserva el pedido; nunca se muestra una confirmación de envío. La apertura depende del acceso del comprador a WhatsApp.
- Textos extensos: nombre de hasta 200 caracteres Unicode y descripción/especificaciones de hasta 5000 cada una, contados después de recortar espacios de los extremos. Los máximos son inclusivos; superarlos indica el campo a corregir, sin truncar ni publicar. Dentro de esos máximos, el nombre puede ocupar varias líneas y el texto completo es consultable sin tapar controles.
- Petición demasiado grande: se muestra que los datos enviados superan el tamaño admitido, se conservan los textos válidos o el pedido y no se confirma la operación ni se abre WhatsApp. Los límites de transmisión y sus errores están definidos en los contratos; no se recorta ni se divide automáticamente el contenido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La tienda DEBE identificarse como “Chaska Store”, usar español de Perú y mostrar todos los importes con `S/` y dos decimales, por ejemplo `S/ 49.90`. Aplica a las seis pantallas y al mensaje del pedido.
- **FR-002**: El visitante DEBE poder consultar catálogo y detalles sin cuenta ni clave. El catálogo DEBE mostrar foto, nombre y precio de cada producto. La acción de agregar se define en FR-005 y se acepta en la historia 2. Aceptación de consulta: historia 1, escenarios 1 y 4.
- **FR-003**: El catálogo DEBE permitir buscar por coincidencia parcial del nombre sin distinguir mayúsculas, combinar esa búsqueda con una de las categorías fijas Celulares, Laptops o Accesorios y volver a Todos. Aceptación: historia 1, escenarios 2, 3 y 5.
- **FR-004**: El detalle DEBE mostrar una foto ampliada, nombre, categoría, precio, descripción completa y especificaciones legibles, junto con “Volver”. Las especificaciones son texto libre y no obligan a campos técnicos propios de celulares. “Agregar al pedido” desde el detalle se define en FR-005 y se acepta en la historia 2. Aceptación de consulta: historia 1, escenario 4.
- **FR-005**: Catálogo y detalle DEBEN ofrecer “Agregar al pedido”. Pulsarlo desde cualquiera de esas pantallas DEBE sumar una unidad a la única línea del producto y dar confirmación visible sin abandonar la pantalla. El contador DEBE sumar unidades, no productos distintos. Aceptación: historia 2, escenarios 1 y 2.
- **FR-006**: “Mi pedido” DEBE mostrar foto, nombre, precio unitario, cantidad entera positiva, subtotal por producto, controles de sumar y restar, “Quitar” y total. Restar en 1 DEBE conservar 1. Aceptación: historia 2, escenario 3.
- **FR-007**: Los subtotales DEBEN ser precio unitario multiplicado por cantidad y el total DEBE ser la suma de subtotales, sin agregar envío, impuestos adicionales ni otros cargos en la página. Aceptación: prueba independiente de la historia 2.
- **FR-008**: El pedido DEBE conservarse al navegar entre catálogo, detalle y “Mi pedido”, recargar la página y regresar desde WhatsApp en el mismo navegador. Aceptación: agregar, navegar, recargar y regresar conserva líneas y cantidades.
- **FR-009**: El pedido vacío DEBE mostrar un mensaje y acceso al catálogo y DEBE impedir el envío. Aceptación: historia 2, escenario 6.
- **FR-010**: “Enviar pedido por WhatsApp” DEBE abrir la conversación del negocio con un mensaje que identifique Chaska Store e incluya nombres, cantidades, precios unitarios, subtotales y total del pedido revisado. Aceptación: historia 2, escenario 4 y su prueba independiente.
- **FR-011**: La tienda DEBE informar que el pedido se coordina por WhatsApp y no se realiza ningún pago en la página. Abrir WhatsApp NO DEBE borrar el pedido ni afirmar que fue enviado, recibido o que la compra está confirmada. Aceptación: historia 2, escenarios 4 y 5.
- **FR-012**: Antes de abrir WhatsApp, la tienda DEBE comprobar que los productos siguen publicados. Si alguno fue retirado, DEBE informar sus nombres, quitar esas líneas y recalcular el total sin abrir WhatsApp hasta una nueva acción del comprador. Aceptación: historia 2, escenario 7.
- **FR-013**: La tienda NO DEBE solicitar nombre, teléfono, correo, dirección ni datos de pago al comprador para armar o abrir su pedido. La coordinación de entrega y pago ocurre en WhatsApp. Aceptación: completar las historias 1 y 2 sin ingresar datos personales.
- **FR-014**: La administración DEBE estar protegida por una clave de administrador. Toda consulta privada, alta o retirada DEBE exigir una sesión válida; una clave vacía o incorrecta DEBE impedir el acceso y mostrar un error sin revelar la clave. Aceptación: historia 3, escenario 1.
- **FR-015**: El panel DEBE listar foto, nombre, categoría, precio y “Quitar” por producto y ofrecer “Agregar producto” y “Cerrar sesión”. Aceptación: historia 3, escenario 2, incluido el estado vacío.
- **FR-016**: El alta DEBE pedir nombre, una categoría fija, precio mayor que cero con hasta dos decimales, descripción, especificaciones y una sola foto; todos son obligatorios y los textos compuestos solo por espacios no son válidos. El nombre admite hasta 200 caracteres Unicode y descripción/especificaciones hasta 5000 cada una, después de recortar espacios de extremos; los máximos son inclusivos y se rechaza el exceso por campo sin truncar. DEBE aceptar JPG, PNG o WebP de hasta 5 MB (5 000 000 bytes) y rechazar archivos que no sean imágenes válidas. Aceptación: historia 3, escenarios 3 y 4 y casos límite de foto y texto.
- **FR-017**: Guardar datos válidos DEBE crear un solo producto completo, mostrar confirmación y regresar al panel; el producto DEBE aparecer en catálogo y detalle con esos datos. Cancelar NO DEBE crear un producto. Aceptación: historia 3, escenarios 3 y 5 y caso límite de guardado.
- **FR-018**: Los errores del alta DEBEN indicar qué corregir, conservar los textos válidos y evitar publicar datos parciales. Aceptación: historia 3, escenario 4 y caso límite de fallo al guardar.
- **FR-019**: Quitar un producto DEBE pedir confirmación con su nombre. Confirmar DEBE retirarlo de la oferta; cancelar DEBE conservarlo. Una dirección antigua de detalle NO DEBE permitir agregarlo. Aceptación: historia 3, escenario 6 y caso límite de detalle retirado.
- **FR-020**: El acceso administrativo DEBE usar una cookie de sesión sin vencimiento por inactividad ni por horas transcurridas. Recargar o cerrar solo una pestaña DEBE conservar el acceso mientras la cookie siga disponible. Al cerrar completamente el navegador, este puede eliminar o restaurar la cookie; se acepta que la restauración conserve el acceso. “Cerrar sesión” DEBE revocar la sesión en el servidor y borrar la cookie; reutilizar una cookie anterior NO DEBE autorizar acceso. Aceptación: historia 3, escenarios 7, 9 y 10.
- **FR-021**: Las altas y retiradas confirmadas DEBEN permanecer tras recargar y al volver a abrir la tienda. Aceptación: historia 3, escenario 8 y consulta pública posterior.
- **FR-022**: Los estados vacíos y fallos DEBEN distinguirse mediante mensajes comprensibles, y los fallos DEBEN permitir reintentar sin afirmar que una operación fallida tuvo éxito. Aceptación: historia 1, escenario 5; historia 2, escenario 6; historia 3, escenario 2; y casos límite de fallos.
- **FR-023**: La experiencia DEBE seguir la composición de las seis referencias: tema oscuro, tarjetas redondeadas, acciones principales azules, envío por WhatsApp verde y retirada administrativa roja. En móvil, catálogo de dos columnas cuando el ancho lo permita, navegación Catálogo/Mi pedido y acción de agregar accesible en el detalle; en escritorio, acceso centrado, panel en tabla y formulario amplio sin barra lateral. Aceptación: comparación visual con la tabla de referencias y SC-004.
- **FR-024**: Los controles DEBEN tener nombres comprensibles, los campos etiquetas y el foco ser visible al usar teclado; los botones fijos NO DEBEN tapar contenido o acciones al desplazarse. Aceptación: recorrer las pantallas con teclado y desplazamiento en los tamaños de SC-004.

### Key Entities *(include if feature involves data)*

- **Producto**: Artículo con identidad propia, nombre, categoría, precio en soles, descripción, especificaciones y foto. Solo los publicados pueden agregarse o incluirse en el mensaje.
- **Categoría**: Celulares, Laptops o Accesorios. Cada producto pertenece a una sola; Todos es una opción de consulta.
- **Pedido en preparación**: Selección del comprador en el mismo navegador, con líneas y total; no representa una venta confirmada ni un historial de pedidos de la tienda.
- **Línea de pedido**: Relaciona un producto con cantidad positiva, precio unitario y subtotal; un producto ocupa una única línea.
- **Acceso del administrador**: Autorización privada obtenida con la clave del negocio y representada por una cookie de sesión sin vencimiento temporal. El navegador controla su eliminación o restauración al cerrarse; “Cerrar sesión” revoca la autorización en el servidor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con seis productos de las tres categorías, una persona sin conocimientos técnicos puede filtrar una categoría, buscar un producto y abrir su detalle en menos de 1 minuto, sin ayuda ni registro.
- **SC-002**: Esa persona puede preparar un pedido de dos productos distintos, ajustar uno a dos unidades y abrir el mensaje de WhatsApp en menos de 2 minutos. En el ejemplo S/ 4299.00 + 2 × S/ 329.00, ambas vistas muestran S/ 4957.00 y el mensaje contiene todas las líneas y cantidades correctas.
- **SC-003**: Con clave, textos y foto disponibles, una persona administradora puede ingresar y publicar un producto en menos de 3 minutos y retirarlo en menos de 1 minuto; puede verificar ambos cambios desde el catálogo después de recargar.
- **SC-004**: A anchos de 390 px para compra y 1440 px para administración, las seis pantallas conservan la jerarquía de las referencias, permiten completar sus acciones y no presentan desplazamiento horizontal ni controles tapados. Catálogo, detalle y pedido también permiten completar el flujo a 360 px y 1440 px.
- **SC-005**: Desde las pantallas de la app, en el 100 % de los intentos con clave incorrecta, acceso al panel sin haber ingresado y retorno al panel tras pulsar “Cerrar sesión” (mediante volver atrás o una pestaña que ya estaba abierta), se solicita ingresar correctamente antes de administrar. Tras un ingreso correcto, recargar o reabrir una pestaña conserva el acceso mientras el navegador mantiene la sesión. En el 100 % de las comprobaciones de alta inválida y retirada cancelada, el catálogo permanece sin ese cambio. Esta aceptación no requiere herramientas de desarrollador; las pruebas técnicas de revocación se definen en el contrato administrativo.
- **SC-006**: En una revisión de las seis pantallas y el mensaje preparado, el 100 % de los importes usa soles con dos decimales; el flujo de compra exige cero datos personales, cero registros y cero pagos dentro de la página.
- **SC-007**: Al terminar una demostración del flujo, una persona sin conocimientos técnicos puede identificar cómo volver al catálogo, revisar su pedido y coordinarlo por WhatsApp, y explicar que abrir el mensaje no confirma una compra ni efectúa un pago.

## Assumptions

### Alcance y valores por defecto

- Esta es una sola feature de la versión 1. Incluye únicamente catálogo, búsqueda por nombre, filtro por categoría, detalle, pedido en preparación, apertura de WhatsApp y acceso administrativo para altas y retiradas.
- Hay un único administrador y un único número de WhatsApp del negocio. No se incluyen cuentas de compradores, edición de productos, gestión de categorías, stock, variantes, reservas, promociones, favoritos, comparación, métricas, historial, gestión de pedidos, pagos ni cálculo de entrega.
- El pedido se conserva en el mismo navegador; no se exige sincronización entre dispositivos. La tienda no conserva un historial de mensajes ni puede comprobar su envío o recepción.
- Los precios de productos publicados no se editan en esta versión. Quitar un producto y dar de alta otro crea una oferta distinta; una línea antigua no se sustituye silenciosamente.
- Las especificaciones se ingresan como texto libre, permitiendo varias líneas; su presentación mantiene la legibilidad sin exigir un editor de tablas. La foto se carga desde un archivo, conforme al formulario de referencia.
- La clave administrativa y el número del negocio deben estar configurados por el responsable antes del uso. Su tratamiento y documentación respetan la constitución; los detalles técnicos se definirán en la planificación.
- El comprador necesita conexión y acceso a WhatsApp para enviar el mensaje. La tienda prepara el resumen y deriva la conversación; disponibilidad real, entrega y pago se acuerdan allí.
- Los límites de una foto de hasta 5 MB, la confirmación de retirada y la conservación del pedido al recargar son valores por defecto documentados para hacer comprobable el flujo simple.

### Referencias visuales revisadas

Las seis imágenes se abrieron antes de redactar. Son la referencia de composición; prevalecen el nombre Chaska Store y las reglas explícitas de esta especificación sobre textos ilustrativos o elementos decorativos. Los productos y precios de ejemplo no obligan a precargar un inventario.

| Imagen | Elementos incorporados |
| --- | --- |
| [01-catalogo-movil](../../docs/diseno/01-catalogo-movil.png) | Búsqueda, filtros Todos/Celulares/Laptops/Accesorios, tarjetas con foto, precio y agregar, contador y navegación inferior. |
| [02-detalle-producto-movil](../../docs/diseno/02-detalle-producto-movil.png) | Volver, foto principal, nombre, precio, descripción, especificaciones y acción inferior de agregar. |
| [03-mi-pedido-movil](../../docs/diseno/03-mi-pedido-movil.png) | Líneas con cantidades y quitar, subtotales, total, botón verde y aviso de ausencia de pago. |
| [04-acceso-administrador-escritorio](../../docs/diseno/04-acceso-administrador-escritorio.png) | Fondo oscuro y tarjeta centrada titulada “Acceso de administrador”. El archivo está recortado y no permite ver los campos; el acceso con clave procede de la constitución. |
| [05-panel-administracion-escritorio](../../docs/diseno/05-panel-administracion-escritorio.png) | Tabla Foto/Nombre/Categoría/Precio/Acción, agregar, quitar y cerrar sesión. |
| [06-agregar-producto-escritorio](../../docs/diseno/06-agregar-producto-escritorio.png) | Nombre, categoría, precio, descripción, especificaciones, carga de foto, cancelar y guardar. |

Los archivos `DESIGN-comprador.md` y `DESIGN-administrador.md` aportan contexto visual. Sus menciones genéricas a dirección de entrega, descuentos, comparaciones u otros componentes no amplían el alcance. Los iconos de compartir o perfil de las imágenes no incorporan funciones de compartir, cuentas de clientes ni nuevas pantallas; el acceso administrativo debe estar identificado con texto comprensible.
