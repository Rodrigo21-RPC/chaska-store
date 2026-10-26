import React from 'react';
import { afterEach, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetailPage from '../../client/src/pages/ProductDetailPage.jsx';
import { products } from '../fixtures/products.js';
afterEach(() => vi.unstubAllGlobals());
const renderPage = () => render(<MemoryRouter initialEntries={[`/productos/${products[0].id}?q=cel&categoria=Celulares`]}><Routes><Route path="/productos/:id" element={<ProductDetailPage />} /></Routes></MemoryRouter>);
it('muestra descripción y especificaciones completas y retorno con filtros', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ product: products[0] }) }));
  renderPage();
  expect(await screen.findByRole('heading', { name: products[0].name })).toBeInTheDocument();
  expect(screen.getByText(/Segunda línea/)).toBeInTheDocument(); expect(screen.getByText(/Conectividad: Wi-Fi/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Volver/ })).toHaveAttribute('href', '/?q=cel&categoria=Celulares');
  expect(screen.getByText('S/ 4299.00')).toBeInTheDocument();
});
it('muestra no disponible y salida al catálogo al retirarse', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({ error: { message: 'Producto no disponible' } }) }));
  renderPage(); expect(await screen.findByRole('heading', { name: 'Producto no disponible' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /catálogo/ })).toHaveAttribute('href', '/');
});
