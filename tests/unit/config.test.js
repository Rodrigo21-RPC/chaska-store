import { describe, it, expect } from 'vitest';
import { readConfig } from '../../server/config.js';
describe('configuración privada', () => {
  it('requiere clave sin mostrar secretos', () => { expect(() => readConfig({})).toThrow('ADMIN_PASSWORD'); });
  it('no detiene el catálogo si falta WhatsApp', () => {
    const config = readConfig({ ADMIN_PASSWORD: 'clave de prueba' });
    expect(config.whatsappNumber).toBe(null);
    expect(config.port).toBe(3000);
    expect(config.origin).toBe('http://localhost:5173');
  });
  it('valida configuración y número internacional', () => {
    expect(readConfig({ ADMIN_PASSWORD: 'x', WHATSAPP_NUMBER: '+51 nope' }).whatsappNumber).toBe(null);
    expect(() => readConfig({ ADMIN_PASSWORD: 'x', PORT: '-1' })).toThrow();
    expect(() => readConfig({ ADMIN_PASSWORD: 'x', APP_ORIGIN: 'not a url' })).toThrow();
    expect(() => readConfig({ ADMIN_PASSWORD: 'x', NODE_ENV: 'production', APP_ORIGIN: 'http://tienda.test' })).toThrow();
  });
});
