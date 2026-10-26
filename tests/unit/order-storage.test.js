import { it, expect } from 'vitest';
import { loadOrder, saveOrder } from '../../client/src/order/storage.js';
import { products } from '../fixtures/products.js';
const memory = () => { let value; return { getItem: () => value ?? null, setItem: (key, data) => { value = data; } }; };
it('conserva selección versionada sin datos ajenos', () => {
  const storage = memory(); const items = [{ productId: products[0].id, name: 'Celular', priceCents: 100, photoUrl: products[0].photoUrl, quantity: 2, adminPassword: 'no guardar' }];
  expect(saveOrder(items, storage)).toBe(null);
  expect(JSON.parse(storage.getItem()).version).toBe(1);
  expect(storage.getItem()).not.toContain('adminPassword');
  expect(loadOrder(storage).items).toHaveLength(1);
});
it('descarta estructura corrupta y versión ajena con aviso', () => {
  expect(loadOrder({ getItem: () => '{bad' }).warning).toBeTruthy();
  expect(loadOrder({ getItem: () => '{"version":2,"items":[]}' }).warning).toBeTruthy();
});
it('avisa cuando el navegador bloquea almacenamiento', () => {
  const storage = { setItem() { throw Error('blocked'); }, getItem() { throw Error('blocked'); } };
  expect(saveOrder([], storage)).toBeTruthy(); expect(loadOrder(storage).warning).toBeTruthy();
});
it('tolera que el propio acceso a localStorage lance un error de seguridad', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('SecurityError'); } });
  try { expect(() => loadOrder()).not.toThrow(); expect(loadOrder().warning).toBeTruthy(); expect(() => saveOrder([])).not.toThrow(); }
  finally { if (previous) Object.defineProperty(globalThis, 'localStorage', previous); else delete globalThis.localStorage; }
});
