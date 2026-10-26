# Chaska Store

Catálogo de celulares, laptops y accesorios, con pedidos por WhatsApp y un panel privado para agregar y quitar productos. Sin pagos, registro de compradores ni historial de ventas dentro de la tienda.

JavaScript, React/Vite/Tailwind, Express, SQLite nativo (`node:sqlite`) y Zod. Pruebas con Vitest, supertest y React Testing Library.

## Iniciar en desarrollo

Requiere Node **22.13.0 o superior compatible** y npm. Se recomienda Node LTS 22 o 24.

Desde la raíz, en PowerShell:

```powershell
npm install
Copy-Item -LiteralPath .env.example -Destination .env
```

Edita `.env`: define una clave propia en `ADMIN_PASSWORD` y el contacto real en `WHATSAPP_NUMBER` (código de país y número, solo dígitos). La clave de ejemplo está vacía y el número es ficticio; no hay acceso administrativo predeterminado. No subas `.env` al repositorio.

```powershell
npm run dev
```

Abre **http://localhost:5173**. El servidor utiliza el puerto 3000 y Vite redirige `/api`. Usa `localhost` de manera consistente; cambiar a `127.0.0.1` cambia el origen. “Administración” lleva al ingreso con la clave configurada.

La base nueva comienza vacía. Agrega productos desde el panel; las fotos de los diseños y los fixtures de pruebas no son inventario inicial.

## Configuración

| Variable | Descripción |
| --- | --- |
| `ADMIN_PASSWORD` | Obligatoria; clave privada del administrador, sin valor por defecto. |
| `WHATSAPP_NUMBER` | Contacto internacional de 7 a 15 dígitos, sin `+`, espacios ni guiones. Si falta o es inválido, se conserva el catálogo y se avisa al intentar abrir WhatsApp. |
| `DATABASE_PATH` | Archivo SQLite durable; por defecto `./data/chaska.sqlite`. |
| `PORT` | Puerto del servidor; por defecto 3000. |
| `APP_ORIGIN` | Origen visible al usuario; en desarrollo `http://localhost:5173`; en producción el origen HTTPS real. |
| `NODE_ENV` | `development` o `production`. |

La clave no se incorpora al cliente compilado. El número de WhatsApp se configura en servidor y será visible en el enlace de contacto por su función. El pedido solo se conserva en el navegador; el servidor revalida sus productos y precios antes de preparar el mensaje.

## Pruebas y producción

```powershell
npm test
npm run build
```

`npm test` termina tras ejecutar la suite; utiliza bases temporales y compila el cliente para verificar las rutas de producción. No toca la base real ni envía mensajes. La validación de interfaz usa Playwright con el Edge instalado, sin descargar navegadores ni usar perfiles personales.

Para producción, configura en `.env` `NODE_ENV=production` y `APP_ORIGIN` con el origen HTTPS de tu dominio; después:

```powershell
npm run build
npm start
```

Express sirve el cliente compilado y la API, escuchando únicamente en `127.0.0.1` (interfaz local). Configura HTTPS en el proxy/servidor del mismo alojamiento, dirigido a ese puerto: las cookies administrativas de producción requieren HTTPS. Guarda SQLite en un volumen durable fuera de `dist`; un alojamiento con disco efímero perdería productos y fotos. La advertencia experimental de `node:sqlite` puede aparecer según la versión de Node; no indica una prueba fallida.

## Sesiones y cambio de clave

La cookie administrativa es HttpOnly, SameSite=Strict y Secure en producción, sin vencimiento por tiempo o inactividad. El navegador puede restaurarla al reabrirse. **“Cerrar sesión” revoca el acceso en el servidor**, incluso si se intenta reutilizar esa cookie. La app revalida acceso al volver a enfocar el panel.

Para cambiar la clave: detén la aplicación, actualiza `ADMIN_PASSWORD` en `.env`, verifica que `DATABASE_PATH` sigue apuntando al archivo correcto y ejecuta:

```powershell
npm run revoke-sessions
npm start
```

El comando elimina únicamente sesiones administrativas; conserva productos y fotos. No borres el archivo SQLite para cambiar una clave.

## Límites y validación

- Nombre: 200 caracteres Unicode; descripción y especificaciones: 5000 cada una, después de recortar espacios exteriores y sin truncar.
- Una foto JPG, PNG o WebP de hasta 5 000 000 bytes; se valida decodificando su contenido y se normaliza a WebP de hasta 1600 px sin ampliar.
- JSON: 65 536 bytes UTF-8; campo multipart: 20 000 bytes; cuerpo multipart completo: 5 100 000 bytes. Los máximos son inclusivos y los excesos muestran un error sin publicar datos parciales.
- El enlace de WhatsApp prepara un mensaje; abrirlo no demuestra que el comprador lo envió ni confirma una venta.

Los recorridos y resultados están en [quickstart](specs/001-chaska-catalogo-whatsapp/quickstart.md) y [validation](specs/001-chaska-catalogo-whatsapp/validation.md). La [spec](specs/001-chaska-catalogo-whatsapp/spec.md), el [plan](specs/001-chaska-catalogo-whatsapp/plan.md) y las [tareas](specs/001-chaska-catalogo-whatsapp/tasks.md) definen el alcance.
