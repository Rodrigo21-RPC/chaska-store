import React from 'react';
import { it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPanelPage from '../../client/src/pages/AdminPanelPage.jsx';
import { products } from '../fixtures/products.js';
afterEach(() => vi.unstubAllGlobals());
it('cancelar confirmación devuelve el foco a Quitar y no cambia el catálogo', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ products: [products[0]] }) }));
  render(<MemoryRouter><AdminPanelPage /></MemoryRouter>);
  const trigger = await screen.findByRole('button', { name: `Quitar ${products[0].name}` });
  trigger.focus(); fireEvent.click(trigger); expect(screen.getByRole('dialog')).toHaveAccessibleName('¿Quitar producto?');
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(trigger).toHaveFocus(); expect(fetch).toHaveBeenCalledTimes(1);
});
