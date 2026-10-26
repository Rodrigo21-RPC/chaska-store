import { it, expect } from 'vitest';
import { parsePrice, formatMoney, subtotal, total } from '../../shared/money.js';
it('convierte soles exactamente por partes', () => { expect(parsePrice('49,90')).toBe(4990); expect(parsePrice('0.01')).toBe(1); expect(parsePrice(' 4299.00 ')).toBe(429900); });
it.each(['0', '-1', '1.001', '1e3', 'NaN', 'Infinity', '1,000.00', '', '900719925474099.99'])('rechaza precio inválido %s', value => { expect(() => parsePrice(value)).toThrow(); });
it('formatea siempre dos decimales y calcula sin flotantes', () => { expect(formatMoney(4990)).toBe('S/ 49.90'); expect(total([429900, subtotal(32900, 2)])).toBe(495700); });
it('rechaza overflow y cantidades inválidas', () => { expect(() => subtotal(Number.MAX_SAFE_INTEGER, 2)).toThrow(); expect(() => subtotal(100, 1.5)).toThrow(); expect(() => total([Number.MAX_SAFE_INTEGER, 1])).toThrow(); });
