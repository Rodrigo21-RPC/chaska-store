import { it, expect } from 'vitest';
import { openDatabase } from '../../server/db.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
it('inicializa tablas sin productos y permite reapertura durable', () => {
  const dir = mkdtempSync(join(tmpdir(), 'chaska-db-')); const path = join(dir, 'db.sqlite');
  let db = openDatabase(path);
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
    expect(tables).toEqual(expect.arrayContaining(['products', 'admin_sessions']));
    expect(db.prepare('SELECT count(*) AS n FROM products').get().n).toBe(0);
    db.prepare('INSERT INTO admin_sessions VALUES (?,?)').run('hash', '2026-10-26');
    db.close(); db = openDatabase(path);
    expect(db.prepare('SELECT count(*) AS n FROM admin_sessions').get().n).toBe(1);
  } finally { db.close(); rmSync(dir, { recursive: true, force: true }); }
});
it('impide productos parciales y hace rollback', () => {
  const db = openDatabase();
  try {
    expect(db.prepare("SELECT name FROM sqlite_master WHERE name='products'").get()).toBeDefined();
    expect(() => db.prepare("INSERT INTO products (id,name) VALUES ('x','incompleto')").run()).toThrow();
    db.exec('BEGIN'); db.prepare('INSERT INTO admin_sessions VALUES (?,?)').run('rollback', 'now'); db.exec('ROLLBACK');
    expect(db.prepare('SELECT count(*) AS n FROM admin_sessions').get().n).toBe(0);
  } finally { db.close(); }
});
