import { Router } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { AppError } from './errors.js';
import { mountAdminProducts } from './products.js';
const digest = value => createHash('sha256').update(value).digest('hex');
function token(req) { const raw = (req.headers.cookie || '').split(';').map(item => item.trim()).find(item => item.startsWith('chaska_admin='))?.slice(13); return /^[A-Za-z0-9_-]{43}$/.test(raw || '') ? raw : null; }
function cookie(res, value, production, clear = false) { res.cookie('chaska_admin', value, { httpOnly: true, sameSite: 'strict', secure: !!production, path: '/', ...(clear ? { expires: new Date(0), maxAge: 0 } : {}) }); }
export function mountAdmin(app, db, config) {
  const router = Router();
  router.use((req, res, next) => {
    if (['POST', 'DELETE'].includes(req.method) && req.headers.origin !== config.origin) return next(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'Esta operación debe realizarse desde la tienda.'));
    next();
  });
  const revoke = req => { const value = token(req); if (value) db.prepare('DELETE FROM admin_sessions WHERE tokenHash=?').run(digest(value)); };
  const requireAuth = (req, res, next) => {
    const value = token(req);
    if (!value || !db.prepare('SELECT tokenHash FROM admin_sessions WHERE tokenHash=?').get(digest(value))) throw new AppError(401, 'AUTH_REQUIRED', 'Ingresa la clave para administrar la tienda.');
    next();
  };
  router.post('/session', (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!config.adminPassword || !timingSafeEqual(Buffer.from(digest(password), 'hex'), Buffer.from(digest(config.adminPassword), 'hex'))) throw new AppError(401, 'INVALID_CREDENTIALS', 'La clave no es correcta.');
    const value = randomBytes(32).toString('base64url');
    db.exec('BEGIN');
    try { revoke(req); db.prepare('INSERT INTO admin_sessions (tokenHash,createdAt) VALUES (?,?)').run(digest(value), new Date().toISOString()); db.exec('COMMIT'); } catch (error) { db.exec('ROLLBACK'); throw error; }
    cookie(res, value, config.production); res.json({ authenticated: true });
  });
  router.get('/session', requireAuth, (req, res) => res.json({ authenticated: true }));
  router.delete('/session', (req, res) => { revoke(req); cookie(res, '', config.production, true); res.sendStatus(204); });
  router.use(requireAuth);
  mountAdminProducts(router, db);
  app.use('/api/admin', router);
}
