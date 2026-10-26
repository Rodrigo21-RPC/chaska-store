import { readConfig } from './config.js';
import { openDatabase } from './db.js';
import { createApp } from './app.js';
try {
  const config = readConfig();
  const db = openDatabase(config.databasePath);
  const server = createApp({ db, config }).listen(config.port, '127.0.0.1', () => console.log(`Chaska Store disponible en http://127.0.0.1:${config.port}.`));
  let closing = false;
  function close() { if (closing) return; closing = true; server.close(() => { db.close(); process.exitCode = 0; }); }
  process.on('SIGINT', close); process.on('SIGTERM', close);
} catch (error) { console.error(error.message); process.exitCode = 1; }
