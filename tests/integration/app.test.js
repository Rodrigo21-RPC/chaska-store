import { it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { openDatabase } from '../../server/db.js';
import { chunkedPost } from '../fixtures/chunked-request.js';
it('devuelve errores JSON en español sin rutas o secretos', async () => {
  const response = await request(createApp({})).get('/api/no-existe');
  expect(response.status).toBe(404); expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
});
it('rechaza JSON malformado y cuerpos grandes', async () => {
  const app = createApp({});
  expect((await request(app).post('/api/no-existe').set('Content-Type', 'application/json').send('{')).status).toBe(400);
  const exact = '{"x":"' + 'a'.repeat(65528) + '"}'; expect(Buffer.byteLength(exact)).toBe(65536);
  expect((await request(app).post('/api/no-existe').set('Content-Type', 'application/json').send(exact)).status).toBe(404);
  const excess = await request(app).post('/api/no-existe').set('Content-Type', 'application/json').send(exact + ' ');
  expect(excess.status).toBe(413); expect(excess.body.error.code).toBe('REQUEST_TOO_LARGE');
});
it('rechaza cuerpo comprimido sin intentar descomprimir', async () => {
  expect((await request(createApp({})).post('/api/no-existe').set('Content-Type', 'application/json').set('Content-Encoding', 'gzip').send('body')).status).toBe(415);
});
it('un fallo de almacenamiento permite reintentar y no expone detalles', async () => {
  const db = openDatabase(); const app = createApp({ db }); db.close();
  const response = await request(app).get('/api/products'); expect(response.status).toBe(503); expect(response.body.error.code).toBe('STORAGE_UNAVAILABLE'); expect(response.text).not.toContain('database');
});
it('cuenta JSON enviado en fragmentos sin Content-Length', async () => {
  const body = Buffer.from('{"x":"' + 'a'.repeat(65529) + '"}');
  const result = await chunkedPost(createApp({}), '/api/no-existe', body, { 'Content-Type': 'application/json' });
  expect(result.status).toBe(413); expect(result.body.error.code).toBe('REQUEST_TOO_LARGE');
});
