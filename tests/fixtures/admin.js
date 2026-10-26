import request from 'supertest';
export const adminConfig = { adminPassword: 'clave-ficticia-de-pruebas', origin: 'http://localhost:5173', whatsappNumber: '51900000000', production: false };
export const fields = { name: 'Producto nuevo', category: 'Accesorios', price: '49.90', description: 'Descripción completa', specifications: 'USB-C\nGarantía: consultar' };
export async function login(app) {
  const response = await request(app).post('/api/admin/session').set('Origin', adminConfig.origin).send({ password: adminConfig.adminPassword });
  return { response, cookie: response.headers['set-cookie']?.[0]?.split(';')[0] || '' };
}
export function upload(app, cookie, data, image, filename = 'foto.webp') {
  let req = request(app).post('/api/admin/products').set('Origin', adminConfig.origin).set('Cookie', cookie || '');
  for (const [key, value] of Object.entries(data)) req = req.field(key, value);
  return req.attach('photo', image, { filename });
}
export function multipart(data, image, size) {
  const boundary = 'chaska-validation-boundary'; const parts = [];
  for (const [name, value] of Object.entries(data)) parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="foto.webp"\r\nContent-Type: image/webp\r\n\r\n`), image, Buffer.from(`\r\n--${boundary}--\r\n`));
  const raw = Buffer.concat(parts); const padding = size ? size - raw.length : 0;
  return { boundary, raw: padding > 1 ? Buffer.concat([Buffer.from(' '.repeat(padding - 2) + '\r\n'), raw]) : raw };
}
