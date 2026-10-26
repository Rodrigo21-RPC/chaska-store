import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export function openDatabase(path = ':memory:') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 200),
      category TEXT NOT NULL CHECK(category IN ('Celulares','Laptops','Accesorios')),
      priceCents INTEGER NOT NULL CHECK(priceCents > 0 AND priceCents <= 9007199254740991),
      description TEXT NOT NULL CHECK(length(trim(description)) BETWEEN 1 AND 5000),
      specifications TEXT NOT NULL CHECK(length(trim(specifications)) BETWEEN 1 AND 5000),
      photo BLOB NOT NULL CHECK(length(photo)>0),
      createdAt TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS admin_sessions (tokenHash TEXT PRIMARY KEY NOT NULL, createdAt TEXT NOT NULL) STRICT;`);
  return db;
}
