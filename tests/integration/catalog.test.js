import { beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { openDatabase } from '../../server/db.js';
import { products, ids, seedProducts } from '../fixtures/products.js';
import { photo } from '../fixtures/photos.js';
let db, app;
beforeEach(async () => { db = openDatabase(); seedProducts(db, await photo()); app = createApp({ db }); });
afterEach(() => db.close());
it('lista resúmenes sin foto binaria, con orden estable y no-store', async () => {
  const r = await request(app).get('/api/products'); expect(r.status).toBe(200);
  expect(r.headers['cache-control']).toBe('no-store');
  expect(r.body.products).toHaveLength(6); expect(r.body.products[0].id).toBe(ids[5]);
  expect(r.body.products[0]).not.toHaveProperty('photo'); expect(r.body.products[0]).not.toHaveProperty('description');
});
it('devuelve detalle completo sin registro y foto WebP', async () => {
  const r = await request(app).get(`/api/products/${ids[0]}`); expect(r.status).toBe(200);
  expect(r.body.product).toEqual(products[0]);
  const image = await request(app).get(products[0].photoUrl); expect(image.status).toBe(200); expect(image.headers['content-type']).toContain('image/webp');
  expect(image.headers.etag).toBeDefined();
});
it('distingue lista vacía y producto inexistente o retirado', async () => {
  db.exec('DELETE FROM products');
  const r = await request(app).get('/api/products'); expect(r.status).toBe(200); expect(r.body.products).toEqual([]);
  expect((await request(app).get(`/api/products/${ids[0]}`)).status).toBe(404);
  expect((await request(app).get(`/api/products/${ids[0]}/photo`)).status).toBe(404);
});
