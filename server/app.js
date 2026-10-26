import express from 'express';
import { errorHandler } from './errors.js';
import { mountCatalog } from './products.js';
import { mountPhotos } from './photos.js';
import { mountPreview } from './order-preview.js';
import { mountAdmin } from './auth.js';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
export function createApp({ db, config = {} } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); res.set('X-Content-Type-Options', 'nosniff'); next(); });
  app.use(express.json({ limit: 65536, inflate: false }));
  if (db) { mountCatalog(app, db); mountPhotos(app, db); mountPreview(app, db, config); mountAdmin(app, db, config); }
  app.use('/api', (req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No se encontró el recurso solicitado.' } }));
  if (config.production) {
    const directory = resolve('dist/client');
    if (!existsSync(resolve(directory, 'index.html'))) throw new Error('Ejecuta npm run build antes de iniciar producción.');
    app.use(express.static(directory, { dotfiles: 'deny', setHeaders: res => res.setHeader('X-Content-Type-Options', 'nosniff') }));
    app.use((req, res, next) => { if (req.method === 'GET' && req.accepts('html')) res.sendFile(resolve(directory, 'index.html')); else next(); });
  }
  app.use(errorHandler);
  return app;
}
