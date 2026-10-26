export function safeAmount(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('El importe supera el valor admitido.');
  return value;
}
export function parsePrice(value) {
  if (typeof value !== 'string' || !/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) throw new Error('Ingresa un precio mayor que cero, con hasta dos decimales.');
  const [whole, fraction = ''] = value.trim().replace(',', '.').split('.');
  const cents = Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0')));
  safeAmount(cents);
  if (!cents) throw new Error('El precio debe ser mayor que cero.');
  return cents;
}
export function formatMoney(cents) { safeAmount(cents); return `S/ ${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`; }
export function subtotal(cents, quantity) {
  safeAmount(cents);
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('La cantidad debe ser un entero positivo.');
  return safeAmount(cents * quantity);
}
export function total(amounts) { return amounts.reduce((sum, amount) => safeAmount(sum + safeAmount(amount)), 0); }
