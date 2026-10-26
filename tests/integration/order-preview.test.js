import { beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { openDatabase } from '../../server/db.js';
import { products, ids, seedProducts } from '../fixtures/products.js';
import { photo } from '../fixtures/photos.js';
let db, app;
const items = [{ productId: ids[0], quantity: 1 }, { productId: ids[1], quantity: 2 }];
beforeEach(async () => { db = openDatabase(); seedProducts(db, await photo()); app = createApp({ db, config: { whatsappNumber: '51900000000' } }); });
afterEach(() => db.close());
it('recalcula del servidor y prepara todas las líneas codificadas sin persistir pedido', async () => {
  const r = await request(app).post('/api/order/preview').send({ items }); expect(r.status).toBe(200);
  expect(r.body.totalCents).toBe(495700); expect(r.body.items[1].subtotalCents).toBe(65800);
  const url = new URL(r.body.whatsappUrl); expect(url.pathname).toBe('/51900000000');
  expect(url.searchParams.get('text')).toContain('S/ 4957.00'); expect(url.searchParams.get('text')).toContain('2 × Accesorio de prueba');
  expect(db.prepare("SELECT name FROM sqlite_master WHERE name='orders'").get()).toBeUndefined();
});
it.each([[], [{ productId: ids[0], quantity: 0 }], [{ productId: ids[0], quantity: 1.5 }], [{ productId: 'invalid', quantity: 1 }], [items[0], items[0]], [{ productId: ids[0], quantity: Number.MAX_SAFE_INTEGER }]])('rechaza entrada inválida %j', async body => { expect((await request(app).post('/api/order/preview').send({ items: body })).status).toBe(400); });
it('no confía en un precio del cliente', async () => { expect((await request(app).post('/api/order/preview').send({ items: [{ ...items[0], priceCents: 1 }] })).status).toBe(400); });
it('devuelve retiradas sin URL y exige nueva acción', async () => {
  db.prepare('DELETE FROM products WHERE id=?').run(ids[0]);
  const r = await request(app).post('/api/order/preview').send({ items }); expect(r.status).toBe(409);
  expect(r.body.removedProductIds).toEqual([ids[0]]); expect(r.body.totalCents).toBe(65800); expect(r.body.whatsappUrl).toBeUndefined();
});
it('conserva selección si WhatsApp no está disponible', async () => {
  const response = await request(createApp({ db, config: {} })).post('/api/order/preview').send({ items }); expect(response.status).toBe(503); expect(response.body.error.code).toBe('WHATSAPP_UNAVAILABLE');
});
