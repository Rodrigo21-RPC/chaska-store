import { beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { openDatabase } from '../../server/db.js';
import { login, adminConfig } from '../fixtures/admin.js';
let db, app;
beforeEach(() => { db = openDatabase(); app = createApp({ db, config: adminConfig }); });
afterEach(() => db.close());
it('exige clave y sesión en todas las rutas privadas', async () => {
  for (const password of ['', 'incorrecta']) expect((await request(app).post('/api/admin/session').set('Origin', adminConfig.origin).send({ password })).status).toBe(401);
  expect((await request(app).get('/api/admin/products')).status).toBe(401);
  expect((await request(app).post('/api/admin/products').set('Origin', adminConfig.origin).send({})).status).toBe(401);
  expect((await request(app).delete('/api/admin/products/00000000-0000-4000-8000-000000000001').set('Origin', adminConfig.origin)).status).toBe(401);
});
it('crea cookie de sesión y persiste sin vencimiento', async () => {
  const { response, cookie } = await login(app); expect(response.status).toBe(200);
  const header = response.headers['set-cookie'][0]; expect(header).toContain('HttpOnly'); expect(header).toContain('SameSite=Strict'); expect(header).toContain('Path=/');
  expect(header).not.toMatch(/Expires|Max-Age/); expect(header).not.toContain(adminConfig.adminPassword);
  const anotherApp = createApp({ db, config: adminConfig });
  expect((await request(anotherApp).get('/api/admin/session').set('Cookie', cookie)).status).toBe(200);
  db.prepare('UPDATE admin_sessions SET createdAt=?').run('2000-01-01');
  expect((await request(app).get('/api/admin/session').set('Cookie', cookie)).status).toBe(200);
});
it('rota token al ingresar y logout revoca incluso una copia anterior', async () => {
  const first = await login(app); expect(first.response.status).toBe(200);
  const second = await request(app).post('/api/admin/session').set('Origin', adminConfig.origin).set('Cookie', first.cookie).send({ password: adminConfig.adminPassword });
  expect(second.status).toBe(200); const cookie = second.headers['set-cookie'][0].split(';')[0]; expect(cookie).not.toBe(first.cookie);
  expect((await request(app).get('/api/admin/session').set('Cookie', first.cookie)).status).toBe(401);
  for (let i = 0; i < 2; i++) expect((await request(app).delete('/api/admin/session').set('Origin', adminConfig.origin).set('Cookie', cookie)).status).toBe(204);
  expect((await request(app).get('/api/admin/products').set('Cookie', cookie)).status).toBe(401);
});
it('rechaza origen ajeno o ausente y usa Secure en producción', async () => {
  expect((await request(app).post('/api/admin/session').send({ password: adminConfig.adminPassword })).status).toBe(403);
  expect((await request(app).post('/api/admin/session').set('Origin', 'https://ajeno.test').send({ password: adminConfig.adminPassword })).status).toBe(403);
  const production = createApp({ db, config: { ...adminConfig, production: true } });
  const { response } = await login(production); expect(response.status).toBe(200); expect(response.headers['set-cookie'][0]).toContain('Secure');
});
