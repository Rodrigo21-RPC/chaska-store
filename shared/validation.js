import { z } from 'zod';
import { parsePrice } from './money.js';
export const categories = ['Celulares', 'Laptops', 'Accesorios'];
export const categorySchema = z.enum(categories, { error: 'Elige Celulares, Laptops o Accesorios.' });
export const positiveInteger = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
export const orderRequestSchema = z.object({ items: z.array(z.object({ productId: z.uuid(), quantity: positiveInteger }).strict()).min(1).refine(items => new Set(items.map(item => item.productId)).size === items.length) }).strict();
export const orderItemSchema = z.object({ productId: z.uuid(), name: z.string().trim().min(1).refine(value => [...value].length <= 200), photoUrl: z.string().regex(/^\/api\/products\/[0-9a-f-]+\/photo$/i), priceCents: positiveInteger, quantity: positiveInteger }).strict();
const text = (label, max) => z.string({ error: `Ingresa ${label}.` }).trim().min(1, `Ingresa ${label}.`).refine(value => [...value].length <= max, `El ${label} admite hasta ${max} caracteres.`);
export const productInputSchema = z.object({
  name: text('nombre', 200), category: categorySchema,
  price: z.string({ error: 'Ingresa el precio.' }).refine(value => { try { parsePrice(value); return true; } catch { return false; } }, 'Ingresa un precio mayor que cero, con hasta dos decimales.'),
  description: text('texto de descripción', 5000), specifications: text('texto de especificaciones', 5000),
}).strict();
export function fieldErrors(error) { const fields = {}; for (const issue of error.issues) fields[issue.path[0] || '_form'] ||= issue.message; return fields; }
