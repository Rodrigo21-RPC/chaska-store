import { subtotal, total, safeAmount } from '../../../shared/money.js';
export function snapshot(product, quantity = 1) { return { productId: product.productId || product.id, name: product.name, photoUrl: product.photoUrl, priceCents: product.priceCents, quantity }; }
export function summarize(items) {
  const lines = items.map(item => ({ ...item, subtotalCents: subtotal(item.priceCents, item.quantity) }));
  return { lines, totalCents: total(lines.map(item => item.subtotalCents)), count: items.reduce((sum, item) => safeAmount(sum + item.quantity), 0) };
}
export function orderReducer(state, action) {
  let next = state;
  if (action.type === 'add') {
    const id = action.product.id || action.product.productId;
    next = state.some(item => item.productId === id) ? state.map(item => item.productId === id ? { ...item, quantity: item.quantity + 1 } : item) : [...state, snapshot(action.product)];
  } else if (action.type === 'change') {
    const quantity = action.quantity === 0 ? 1 : action.quantity;
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('La cantidad debe ser un entero positivo.');
    next = state.map(item => item.productId === action.id ? { ...item, quantity } : item);
  } else if (action.type === 'remove') next = state.filter(item => item.productId !== action.id);
  else if (action.type === 'reconcile') next = action.items.map(item => snapshot(item, item.quantity));
  summarize(next); return next;
}
