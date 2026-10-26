import { existsSync } from 'node:fs';
import { readConfig } from '../server/config.js';
import { openDatabase } from '../server/db.js';
try {
  const config = readConfig();
  if (!existsSync(config.databasePath)) throw new Error('No existe la base indicada en DATABASE_PATH. No se modificó ningún dato.');
  const db = openDatabase(config.databasePath);
  try { db.exec('DELETE FROM admin_sessions'); console.log('Sesiones administrativas revocadas. Los productos y fotos se conservaron.'); } finally { db.close(); }
} catch (error) { console.error(error.message); process.exitCode = 1; }
