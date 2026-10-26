import { beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { openDatabase } from '../../server/db.js';
import { adminConfig, login, upload, fields, multipart } from '../fixtures/admin.js';
import { photo, corruptPhoto } from '../fixtures/photos.js';
import { chunkedPost } from '../fixtures/chunked-request.js';
let db, app, cookie, image;
beforeEach(async () => { db = openDatabase(); app = createApp({ db, config: adminConfig }); ({ cookie } = await login(app)); image = await photo(); });
afterEach(() => db.close());
it('publica una sola fila completa y retira junto con su foto', async () => {
  const response = await upload(app, cookie, fields, image); expect(response.status).toBe(201); const id = response.body.product.id;
  expect(response.body.product).toMatchObject({ name: fields.name, priceCents: 4990 });
  expect((await request(app).get('/api/admin/products').set('Cookie', cookie)).body.products).toHaveLength(1);
  expect((await request(app).get(`/api/products/${id}`)).status).toBe(200);
  for (let i = 0; i < 2; i++) expect((await request(app).delete(`/api/admin/products/${id}`).set('Cookie', cookie).set('Origin', adminConfig.origin)).status).toBe(204);
  expect((await request(app).get(`/api/products/${id}/photo`)).status).toBe(404);
});
it('nombres iguales reciben identidades distintas', async () => {
  const first = await upload(app, cookie, fields, image); const second = await upload(app, cookie, fields, image); expect(first.status).toBe(201); expect(second.status).toBe(201); expect(first.body.product.id).not.toBe(second.body.product.id);
});
it.each(['jpeg', 'png', 'webp'])('acepta archivo real %s sin confiar en el MIME declarado', async format => { expect((await upload(app, cookie, fields, await photo(format), 'archivo.bin')).status).toBe(201); });
it.each([{ name: ' ' }, { category: 'Todos' }, { price: '0' }, { price: '1.001' }, { description: '' }, { specifications: '  ' }, { unknown: 'x' }])('rechaza alta inválida %j sin crear fila', async invalid => {
  const r = await upload(app, cookie, { ...fields, ...invalid }, image); expect(r.status).toBe(400); expect(db.prepare('SELECT count(*) AS n FROM products').get().n).toBe(0);
});
it.each([['name', 200], ['description', 5000], ['specifications', 5000]])('respeta máximo inclusivo de %s después de trim y sin truncar', async (name, limit) => {
  const valid = await upload(app, cookie, { ...fields, [name]: `  ${'😀'.repeat(limit - 2)}ab  ` }, image); expect(valid.status).toBe(201);
  expect([...valid.body.product[name]].length).toBe(limit);
  const invalid = await upload(app, cookie, { ...fields, [name]: 'a'.repeat(limit + 1) }, image); expect(invalid.status).toBe(400); expect(invalid.body.error.fields[name]).toBeTruthy();
});
it('acepta máximos de todos los campos simultáneamente', async () => {
  expect((await upload(app, cookie, { ...fields, name: 'n'.repeat(200), description: 'd'.repeat(5000), specifications: 'e'.repeat(5000) }, image)).status).toBe(201);
});
it('rechaza archivo corrupto, dos fotos y campos repetidos', async () => {
  expect((await upload(app, cookie, fields, corruptPhoto)).status).toBe(400);
  expect((await upload(app, cookie, fields, image).attach('photo', image, 'otra.webp')).status).toBe(400);
  expect((await upload(app, cookie, fields, image).field('name', 'repetido')).status).toBe(400);
  expect(db.prepare('SELECT count(*) AS n FROM products').get().n).toBe(0);
});
it('aplica frontera de bytes por campo sin confundir caracteres Unicode', async () => {
  const valid = await upload(app, cookie, { ...fields, description: '😀'.repeat(5000) }, image); expect(valid.status).toBe(201);
  const invalid = await upload(app, cookie, { ...fields, description: '😀'.repeat(5000) + 'a' }, image); expect(invalid.status).toBe(413); expect(invalid.body.error.code).toBe('FIELD_TOO_LARGE');
});
it('aplica la frontera del cuerpo completo incluidos delimitadores', async () => {
  for (const size of [5_100_000, 5_100_001]) {
    const body = multipart(fields, image, size); expect(body.raw.length).toBe(size);
    const r = await request(app).post('/api/admin/products').set('Cookie', cookie).set('Origin', adminConfig.origin).set('Content-Type', `multipart/form-data; boundary=${body.boundary}`).send(body.raw);
    expect(r.status).toBe(size === 5_100_000 ? 201 : 413);
    if (size > 5_100_000) expect(r.body.error.code).toBe('REQUEST_TOO_LARGE');
  }
});
it('cuenta multipart fragmentado sin Content-Length', async () => {
  const body = multipart(fields, image, 5_100_001);
  const r = await chunkedPost(app, '/api/admin/products', body.raw, { Cookie: cookie, Origin: adminConfig.origin, 'Content-Type': `multipart/form-data; boundary=${body.boundary}` }); expect(r.status).toBe(413); expect(r.body.error.code).toBe('REQUEST_TOO_LARGE');
  expect(db.prepare('SELECT count(*) AS n FROM products').get().n).toBe(0);
});
