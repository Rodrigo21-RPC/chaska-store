import { beforeAll, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../../server/app.js';
import { openDatabase } from '../../server/db.js';
import { adminConfig, login, upload, fields } from '../fixtures/admin.js';
import { photo } from '../fixtures/photos.js';
beforeAll(() => { execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'pipe', windowsHide: true }); }, 30000);
it('sirve cliente compilado y rutas directas sin convertir errores API en HTML', async () => {
  const db = openDatabase();
  try {
    const app = createApp({ db, config: { ...adminConfig, production: true } });
    for (const path of ['/', '/productos/00000000-0000-4000-8000-000000000001', '/mi-pedido', '/admin/acceso', '/admin', '/admin/productos/nuevo']) {
      const r = await request(app).get(path); expect(r.status).toBe(200); expect(r.headers['content-type']).toContain('text/html'); expect(r.text).toContain('Chaska Store');
    }
    const missing = await request(app).get('/api/desconocido'); expect(missing.status).toBe(404); expect(missing.headers['content-type']).toContain('application/json');
    expect((await request(app).get('/api/admin/products')).status).toBe(401);
  } finally { db.close(); }
});
it('altas, fotos, retiradas y sesiones permanecen tras cerrar y reabrir SQLite', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'chaska-persistence-')); const path = join(directory, 'db.sqlite');
  let db = openDatabase(path);
  try {
    let app = createApp({ db, config: adminConfig }); const { cookie } = await login(app);
    const created = await upload(app, cookie, fields, await photo()); expect(created.status).toBe(201); const id = created.body.product.id;
    db.close(); db = openDatabase(path); app = createApp({ db, config: adminConfig });
    expect((await request(app).get(`/api/products/${id}/photo`)).status).toBe(200);
    expect((await request(app).delete(`/api/admin/products/${id}`).set('Cookie', cookie).set('Origin', adminConfig.origin)).status).toBe(204);
    db.close(); db = openDatabase(path); app = createApp({ db, config: adminConfig });
    expect((await request(app).get(`/api/products/${id}`)).status).toBe(404);
  } finally { db.close(); rmSync(directory, { recursive: true, force: true }); }
});
