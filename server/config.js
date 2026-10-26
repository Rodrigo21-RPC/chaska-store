import { resolve } from 'node:path';
export function readConfig(env = process.env) {
  if (!env.ADMIN_PASSWORD?.trim()) throw new Error('Configura ADMIN_PASSWORD antes de iniciar.');
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un puerto válido.');
  const production = env.NODE_ENV === 'production';
  let origin;
  try { const url = new URL(env.APP_ORIGIN || 'http://localhost:5173'); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error(); origin = url.origin; } catch { throw new Error('APP_ORIGIN debe ser un origen válido.'); }
  if (production && !origin.startsWith('https://')) throw new Error('APP_ORIGIN requiere HTTPS en producción.');
  const number = env.WHATSAPP_NUMBER || '';
  return { adminPassword: env.ADMIN_PASSWORD, whatsappNumber: /^[1-9]\d{6,14}$/.test(number) ? number : null, port, origin, production, databasePath: resolve(env.DATABASE_PATH || './data/chaska.sqlite') };
}
