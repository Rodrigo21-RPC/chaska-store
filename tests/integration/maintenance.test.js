import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../../server/db.js';
import { seedProducts } from '../fixtures/products.js';
import { photo } from '../fixtures/photos.js';
it('revoca sesiones por mantenimiento sin borrar productos ni fotos', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'chaska-maintenance-')); const path = join(directory, 'db.sqlite'); const db = openDatabase(path);
  try {
    seedProducts(db, await photo()); db.prepare('INSERT INTO admin_sessions VALUES (?,?)').run('testhash', 'now');
    const result = spawnSync(process.execPath, ['scripts/revoke-sessions.js'], { env: { ...process.env, ADMIN_PASSWORD: 'prueba-maintenance', DATABASE_PATH: path, NODE_ENV: 'development', APP_ORIGIN: 'http://localhost:5173' }, encoding: 'utf8', windowsHide: true });
    expect(result.status).toBe(0); expect(db.prepare('SELECT count(*) AS n FROM admin_sessions').get().n).toBe(0); expect(db.prepare('SELECT count(*) AS n FROM products').get().n).toBe(6);
    expect(result.stdout).not.toContain('prueba-maintenance');
  } finally { db.close(); rmSync(directory, { recursive: true, force: true }); }
});
