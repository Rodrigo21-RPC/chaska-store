import { AppError } from './errors.js';
import { randomUUID } from 'node:crypto';
import { productInputSchema, fieldErrors } from '../shared/validation.js';
import { parsePrice } from '../shared/money.js';
import { receiveUpload } from './upload.js';
import { normalizePhoto } from './photos.js';
export const summaryColumns = 'id,name,category,priceCents';
export const detailColumns = `${summaryColumns},description,specifications`;
export function productDto(row) { return { ...row, photoUrl: `/api/products/${row.id}/photo` }; }
export function mountCatalog(app, db) {
  app.get('/api/products', (req, res) => res.json({ products: db.prepare(`SELECT ${summaryColumns} FROM products ORDER BY createdAt DESC,id DESC`).all().map(productDto) }));
  app.get('/api/products/:id', (req, res) => {
    const row = db.prepare(`SELECT ${detailColumns} FROM products WHERE id=?`).get(req.params.id);
    if (!row) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no disponible.');
    res.json({ product: productDto(row) });
  });
}
export function mountAdminProducts(router, db) {
  router.get('/products', (req, res) => res.json({ products: db.prepare(`SELECT ${summaryColumns} FROM products ORDER BY createdAt DESC,id DESC`).all().map(productDto) }));
  router.post('/products', receiveUpload, async (req, res) => {
    const parsed = productInputSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', fieldErrors(parsed.error));
    const image = await normalizePhoto(req.file?.buffer);
    const input = parsed.data; const id = randomUUID(); const priceCents = parsePrice(input.price);
    db.prepare('INSERT INTO products (id,name,category,priceCents,description,specifications,photo,createdAt) VALUES (?,?,?,?,?,?,?,?)').run(id, input.name, input.category, priceCents, input.description, input.specifications, image, new Date().toISOString());
    res.status(201).location(`/api/products/${id}`).json({ product: productDto({ id, name: input.name, category: input.category, priceCents, description: input.description, specifications: input.specifications }) });
  });
  router.delete('/products/:id', (req, res) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) throw new AppError(400, 'VALIDATION_ERROR', 'El identificador del producto no es válido.');
    db.prepare('DELETE FROM products WHERE id=?').run(req.params.id); res.sendStatus(204);
  });
}
