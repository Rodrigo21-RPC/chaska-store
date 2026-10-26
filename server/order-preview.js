import { orderRequestSchema } from '../shared/validation.js';
import { subtotal, total, formatMoney } from '../shared/money.js';
import { summaryColumns, productDto } from './products.js';
import { AppError } from './errors.js';
export function mountPreview(app, db, config) {
  app.post('/api/order/preview', (req, res) => {
    const parsed = orderRequestSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Revisa los productos y cantidades del pedido.');
    const requested = parsed.data.items;
    const rows = db.prepare(`SELECT ${summaryColumns} FROM products WHERE id IN (SELECT value FROM json_each(?))`).all(JSON.stringify(requested.map(item => item.productId)));
    const lookup = new Map(rows.map(row => [row.id, row]));
    const items = []; const removedProductIds = [];
    try {
      for (const line of requested) {
        const row = lookup.get(line.productId);
        if (!row) { removedProductIds.push(line.productId); continue; }
        const p = productDto(row);
        items.push({ productId: p.id, name: p.name, photoUrl: p.photoUrl, priceCents: p.priceCents, quantity: line.quantity, subtotalCents: subtotal(p.priceCents, line.quantity) });
      }
      const totalCents = total(items.map(item => item.subtotalCents));
      if (removedProductIds.length) return res.status(409).json({ error: { code: 'PRODUCTS_UNAVAILABLE', message: 'Algunos productos ya no están disponibles. Revisa el pedido.' }, removedProductIds, items, totalCents });
      if (!config.whatsappNumber) throw new AppError(503, 'WHATSAPP_UNAVAILABLE', 'WhatsApp no está disponible en este momento. Tu pedido se conserva.');
      const message = ['Hola, Chaska Store. Quiero coordinar este pedido:', ...items.map(item => `${item.quantity} × ${item.name} — ${formatMoney(item.priceCents)} c/u — Subtotal ${formatMoney(item.subtotalCents)}`), `Total: ${formatMoney(totalCents)}`].join('\n');
      res.json({ items, totalCents, message, whatsappUrl: `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}` });
    } catch (error) { if (error instanceof AppError) throw error; throw new AppError(400, 'VALIDATION_ERROR', error.message); }
  });
}
