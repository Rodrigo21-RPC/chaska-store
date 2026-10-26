import React from 'react';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CatalogPage from '../../client/src/pages/CatalogPage.jsx';
import { products } from '../fixtures/products.js';
beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ products }) })));
afterEach(() => vi.unstubAllGlobals());
it('combina nombre sin mayúsculas y categoría y conserva el filtro al borrar texto', async () => {
  render(<MemoryRouter><CatalogPage /></MemoryRouter>);
  expect(await screen.findByRole('link', { name: 'Celular de prueba' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Laptops' }));
  expect(screen.queryByRole('link', { name: 'Celular de prueba' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'PRO' } });
  expect(screen.getByRole('link', { name: 'Laptop Pro de prueba' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Laptop de prueba' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
  expect(screen.getByRole('link', { name: 'Laptop de prueba' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Celular de prueba' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
  expect(screen.getByRole('link', { name: 'Celular de prueba' })).toBeInTheDocument();
});
it('muestra ausencia de coincidencias y permite limpiar filtros', async () => {
  render(<MemoryRouter><CatalogPage /></MemoryRouter>); await screen.findByRole('link', { name: 'Celular de prueba' });
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no-existe' } });
  expect(screen.getByText(/No encontramos productos/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' })); expect(screen.getByRole('link', { name: 'Celular de prueba' })).toBeInTheDocument();
});
it('separa catálogo vacío de error con reintento', async () => {
  fetch.mockRejectedValueOnce(new Error('red'));
  render(<MemoryRouter><CatalogPage /></MemoryRouter>);
  expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ products: [] }) });
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(screen.getByText(/Todavía no hay productos/)).toBeInTheDocument());
});
