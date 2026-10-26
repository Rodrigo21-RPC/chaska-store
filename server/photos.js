import { AppError } from './errors.js';
import sharp from 'sharp';
export async function normalizePhoto(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new AppError(400, 'INVALID_PHOTO', 'Selecciona una foto JPG, PNG o WebP válida.', { photo: 'Selecciona una foto válida.' });
  if (buffer.length > 5_000_000) throw new AppError(413, 'PHOTO_TOO_LARGE', 'La foto admite hasta 5 MB.', { photo: 'La foto admite hasta 5 MB.' });
  try {
    const image = sharp(buffer, { failOn: 'warning', limitInputPixels: false, sequentialRead: true }); const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format)) throw new Error('format');
    return await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch { throw new AppError(400, 'INVALID_PHOTO', 'La foto no es válida. Usa JPG, PNG o WebP.', { photo: 'La foto está dañada o su formato no está admitido.' }); }
}
export function mountPhotos(app, db) {
  app.get('/api/products/:id/photo', (req, res) => {
    const row = db.prepare('SELECT photo FROM products WHERE id=?').get(req.params.id);
    if (!row) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no disponible.');
    res.set('Cache-Control', 'public, max-age=0, must-revalidate').type('webp').send(Buffer.from(row.photo));
  });
}
