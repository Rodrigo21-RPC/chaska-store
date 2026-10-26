import { z } from 'zod';
import { orderItemSchema } from '../../../shared/validation.js';
import { summarize, snapshot } from './reducer.js';
const schema = z.object({ version: z.literal(1), items: z.array(orderItemSchema).refine(items => new Set(items.map(item => item.productId)).size === items.length) }).strict();
export function loadOrder(storage) {
  try { storage ??= globalThis.localStorage; const raw = storage.getItem('chaska.order.v1'); if (raw === null) return { items: [] }; const parsed = schema.parse(JSON.parse(raw)); summarize(parsed.items); return { items: parsed.items }; }
  catch { return { items: [], warning: 'No se pudo recuperar el pedido anterior. El almacenamiento del navegador podría estar bloqueado o contener datos dañados.' }; }
}
export function saveOrder(items, storage) {
  try { storage ??= globalThis.localStorage; storage.setItem('chaska.order.v1', JSON.stringify({ version: 1, items: items.map(item => snapshot(item, item.quantity)) })); return null; }
  catch { return 'No se pudo guardar el pedido en este navegador. Podría perderse al recargar.'; }
}
