import { chromium } from 'playwright';
import { mkdir, mkdtemp } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const directory = 'data/qa'; await mkdir(directory, { recursive: true });
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const start = Date.now();
  await page.goto('http://localhost:5173');
  await page.getByRole('link', { name: 'Celular de prueba', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Celulares', exact: true }).click();
  await page.getByRole('searchbox').fill('CELULAR');
  await page.getByRole('link', { name: 'Celular de prueba', exact: true }).click();
  await page.getByRole('heading', { name: 'Celular de prueba' }).waitFor();
  assert.ok(Date.now() - start < 60_000);
  await page.screenshot({ path: `${directory}/02-detalle-390.png`, fullPage: true });
  await page.getByRole('link', { name: 'Volver', exact: true }).click();
  assert.equal(await page.getByRole('searchbox').inputValue(), 'CELULAR');
  results.push({ scenario: 'SC-001 consulta y retorno', milliseconds: Date.now() - start });
  for (const width of [360, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Celular de prueba', exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `desbordamiento ${width}`);
    await page.screenshot({ path: `${directory}/01-catalogo-${width}.png`, fullPage: true });
  }
  console.log(JSON.stringify(results));
  if (process.argv.includes('--order')) {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:5173');
    const startOrder = Date.now();
    await page.getByRole('button', { name: 'Agregar al pedido: Celular de prueba', exact: true }).click();
    await page.getByRole('button', { name: 'Agregar al pedido: Accesorio de prueba', exact: true }).click();
    await page.getByRole('button', { name: 'Agregar al pedido: Accesorio de prueba', exact: true }).click();
    await page.goto('http://localhost:5173/mi-pedido');
    await page.getByText('S/ 4957.00', { exact: true }).waitFor();
    await page.reload(); await page.getByText('S/ 4957.00', { exact: true }).waitFor();
    let outbound;
    await page.route('https://wa.me/**', async route => { outbound = route.request().url(); await route.fulfill({ contentType: 'text/html', body: '<h1>WhatsApp interceptado: no se envía ningún mensaje</h1>' }); });
    await page.getByRole('button', { name: 'Enviar pedido por WhatsApp', exact: true }).click();
    await page.waitForURL('https://wa.me/**');
    assert.match(new URL(outbound).searchParams.get('text'), /S\/ 4957.00/);
    results.push({ scenario: 'SC-002 pedido y mensaje interceptado', milliseconds: Date.now() - startOrder });
    await page.goBack(); await page.getByText('S/ 4957.00', { exact: true }).waitFor();
    for (const width of [360, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await page.screenshot({ path: `${directory}/03-pedido-${width}.png`, fullPage: true }); }
    console.log(JSON.stringify(results));
  }
  if (process.argv.includes('--admin')) {
    const startAdmin = Date.now();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://localhost:5173/admin');
    await page.getByLabel('Clave del administrador').fill('incorrecta');
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await page.getByRole('alert').waitFor();
    await page.screenshot({ path: `${directory}/04-acceso-1440.png`, fullPage: true });
    await page.getByLabel('Clave del administrador').fill(process.env.ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await page.getByRole('heading', { name: 'Panel de administración' }).waitFor();
    assert.ok(await page.getByRole('button', { name: 'Quitar Celular de prueba', exact: true }).evaluate(element => element.getBoundingClientRect().height <= 50), 'Quitar debe mantenerse en una línea a 1440 px');
    await page.screenshot({ path: `${directory}/05-panel-1440.png`, fullPage: true });
    await page.getByRole('link', { name: 'Agregar producto', exact: true }).click();
    await page.getByLabel('Nombre', { exact: true }).fill('Accesorio validación');
    await page.getByLabel('Precio (S/)', { exact: true }).fill('49.90');
    await page.getByLabel('Descripción', { exact: true }).fill('Descripción de validación.');
    await page.getByLabel('Especificaciones', { exact: true }).fill('USB-C\nUna foto');
    await page.getByLabel('Foto', { exact: true }).setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: await sharp({ create: { width: 300, height: 300, channels: 3, background: '#283b53' } }).png().toBuffer() });
    await page.screenshot({ path: `${directory}/06-agregar-1440.png`, fullPage: true });
    await page.getByRole('button', { name: 'Guardar producto', exact: true }).click();
    await page.getByRole('cell', { name: 'Accesorio validación', exact: true }).waitFor();
    const published = Date.now() - startAdmin; assert.ok(published < 180_000);
    const startRemoval = Date.now();
    await page.getByRole('button', { name: 'Quitar Accesorio validación', exact: true }).click();
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await page.getByRole('cell', { name: 'Accesorio validación', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Quitar Accesorio validación', exact: true }).click();
    await page.getByRole('button', { name: 'Quitar producto', exact: true }).click();
    await page.getByRole('cell', { name: 'Accesorio validación', exact: true }).waitFor({ state: 'detached' });
    assert.ok(Date.now() - startRemoval < 60_000);
    await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await page.getByLabel('Clave del administrador').waitFor();
    await page.goto('http://localhost:5173/admin'); await page.getByLabel('Clave del administrador').waitFor();
    results.push({ scenario: 'SC-003/SC-005 alta, cancelar, retirar y logout', publishMilliseconds: published, removalMilliseconds: Date.now() - startRemoval });
    console.log(JSON.stringify(results));
  }
  if (process.argv.includes('--keyboard')) {
    for (const width of [360, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/', '/productos/00000000-0000-4000-8000-000000000001', '/mi-pedido']) {
        await page.goto(`http://localhost:5173${path}`); await page.locator('h1,h2').first().waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} a ${width}`);
        await page.keyboard.press('Tab');
        assert.ok(await page.evaluate(() => { const el = document.activeElement; return el.tagName !== 'BODY' && getComputedStyle(el).outlineStyle !== 'none'; }), 'foco visible de teclado');
        if (path === '/') { await page.getByRole('button', { name: 'Agregar al pedido: Celular de prueba', exact: true }).waitFor(); await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); assert.ok(await page.locator('.product-card').last().evaluate(element => element.getBoundingClientRect().bottom <= innerHeight - 76), 'última tarjeta no tapada por navegación'); }
      }
    }
    results.push({ scenario: 'SC-004/FR-024 teclado y tamaños', widths: [360,390,1440], pageErrors: errors }); assert.equal(errors.length, 0); console.log(JSON.stringify(results));
  }
  if (process.argv.includes('--scale')) {
    const base = await (await page.request.get('http://localhost:5173/api/products')).json();
    const hundred = Array.from({ length: 100 }, (_, index) => ({ ...base.products[index % base.products.length], id: `validation-${index}`, name: `Producto de validación ${index + 1}` }));
    await page.route('**/api/products', route => route.fulfill({ json: { products: hundred } }));
    await page.goto('http://localhost:5173'); await page.locator('.product-card').nth(99).waitFor();
    await page.getByRole('searchbox').fill('Producto de validación 100'); await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 1); assert.equal(await page.locator('.product-card').count(), 1);
    await page.unroute('**/api/products'); results.push({ scenario: '100 productos: render y filtro en cliente', products: 100 }); console.log(JSON.stringify(results));
  }
  if (process.argv.includes('--sessions')) {
    for (const restore of [false, true]) {
      const profile = await mkdtemp(`${directory}/session-`);
      const options = { channel: 'msedge', headless: true, args: restore ? ['--restore-last-session'] : [] };
      let context = await chromium.launchPersistentContext(profile, options);
      let sessionPage = context.pages()[0] || await context.newPage();
      await sessionPage.goto('http://localhost:5173/admin'); await sessionPage.getByLabel('Clave del administrador').fill(process.env.ADMIN_PASSWORD); await sessionPage.getByRole('button', { name: 'Ingresar', exact: true }).click(); await sessionPage.getByRole('heading', { name: 'Panel de administración' }).waitFor();
      assert.equal((await context.cookies()).find(cookie => cookie.name === 'chaska_admin').expires, -1);
      await context.close(); context = await chromium.launchPersistentContext(profile, options);
      sessionPage = context.pages()[0] || await context.newPage(); await sessionPage.goto('http://localhost:5173/admin');
      await sessionPage.locator('input[type="password"],h1').first().waitFor();
      await sessionPage.waitForFunction(() => document.querySelector('input[type="password"]') || document.body.textContent.includes('Panel de administración'));
      const retained = (await sessionPage.getByRole('heading', { name: 'Panel de administración' }).count()) > 0;
      if (!retained) { await sessionPage.getByLabel('Clave del administrador').fill(process.env.ADMIN_PASSWORD); await sessionPage.getByRole('button', { name: 'Ingresar', exact: true }).click(); }
      await sessionPage.getByRole('button', { name: 'Cerrar sesión', exact: true }).click(); await sessionPage.getByLabel('Clave del administrador').waitFor();
      await context.close(); results.push({ scenario: 'Cierre y reapertura de navegador', restoreArgument: restore, retainedSession: retained });
    }
    console.log(JSON.stringify(results));
  }
} finally { await browser.close(); }
process.exit(0);
