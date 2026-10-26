import { it, expect } from 'vitest';
import { orderReducer, summarize } from '../../client/src/order/reducer.js';
import { products } from '../fixtures/products.js';
it('agrega una sola línea, suma unidades y calcula el ejemplo exacto', () => {
  let state = orderReducer([], { type: 'add', product: products[0] });
  state = orderReducer(state, { type: 'add', product: products[1] }); state = orderReducer(state, { type: 'add', product: products[1] });
  expect(state).toHaveLength(2); expect(summarize(state)).toMatchObject({ count: 3, totalCents: 495700 });
});
it('restar en uno no quita, quitar elimina y los ids no se sustituyen por nombre', () => {
  const items = [{ productId: products[0].id, name: products[0].name, priceCents: 100, quantity: 1, photoUrl: products[0].photoUrl }];
  expect(orderReducer(items, { type: 'change', id: items[0].productId, quantity: 0 })).toEqual(items);
  expect(orderReducer(items, { type: 'remove', id: items[0].productId })).toEqual([]);
  expect(orderReducer(items, { type: 'reconcile', items: [] })).toEqual([]);
});
it('rechaza cantidades fraccionarias y overflow sin modificar selección', () => {
  const items = [{ productId: products[0].id, name: 'Prueba', priceCents: 100, quantity: 1 }];
  expect(() => orderReducer(items, { type: 'change', id: items[0].productId, quantity: 1.5 })).toThrow();
  expect(() => summarize([{ ...items[0], quantity: Number.MAX_SAFE_INTEGER }])).toThrow();
});
