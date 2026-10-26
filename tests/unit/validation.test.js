import { it, expect } from 'vitest';
import { categorySchema } from '../../shared/validation.js';
it('solo permite las tres categorías fijas', () => { expect(categorySchema.safeParse('Todos').success).toBe(false); expect(categorySchema.safeParse('Celulares').success).toBe(true); });
