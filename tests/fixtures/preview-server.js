// Servidor de validación aislado: nunca usa la base real de la tienda.
import { openDatabase } from '../../server/db.js';
import { readConfig } from '../../server/config.js';
import { createApp } from '../../server/app.js';
import { seedProducts } from './products.js';
import { photo } from './photos.js';
const config = readConfig();
const db = openDatabase();
seedProducts(db, await photo());
const server = createApp({ db, config }).listen(config.port, 'localhost', () => console.log('Vista de validación con datos temporales disponible.'));
process.on('SIGTERM', () => server.close(() => { db.close(); process.exit(0); }));
