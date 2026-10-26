import React from 'react';
import { it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderProvider from '../../client/src/order/OrderProvider.jsx';
import OrderPage from '../../client/src/pages/OrderPage.jsx';
import ProductCard from '../../client/src/components/ProductCard.jsx';
import { products } from '../fixtures/products.js';
afterEach(() => vi.unstubAllGlobals());
function renderFlow(navigate = vi.fn()) { return render(<MemoryRouter><OrderProvider><ProductCard product={products[0]} /><ProductCard product={products[1]} /><OrderPage navigate={navigate} /></OrderProvider></MemoryRouter>); }
it('agrega y quita, ajusta unidades y muestra total exacto sin pedir datos personales', async () => {
  renderFlow();
  expect(screen.queryByText('Tu pedido está vacío')).toBeInTheDocument();
  const buttons = screen.getAllByRole('button', { name: /Agregar al pedido/ });
  fireEvent.click(buttons[0]); fireEvent.click(buttons[1]); fireEvent.click(buttons[1]);
  expect(screen.getByText('S/ 4957.00')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Disminuir cantidad de Celular de prueba' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Quitar Celular de prueba' })); fireEvent.click(screen.getByRole('button', { name: 'Quitar Accesorio de prueba' }));
  expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument(); expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
it('informa retiradas, recalcula y no abre WhatsApp sin nueva acción', async () => {
  const navigate = vi.fn(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: { code: 'PRODUCTS_UNAVAILABLE', message: 'Revisa tu pedido.' }, removedProductIds: [products[0].id], items: [{ productId: products[1].id, ...products[1], quantity: 1, subtotalCents: 32900 }], totalCents: 32900 }) }));
  renderFlow(navigate); const buttons = screen.getAllByRole('button', { name: /Agregar al pedido/ }); fireEvent.click(buttons[0]); fireEvent.click(buttons[1]);
  fireEvent.click(screen.getByRole('button', { name: /Enviar pedido por WhatsApp/ }));
  expect(await screen.findByText(/Ya no disponible: Celular de prueba/)).toBeInTheDocument(); expect(navigate).not.toHaveBeenCalled();
});
it('error de tamaño conserva pedido y no navega', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 413, json: async () => ({ error: { message: 'Los datos enviados superan el tamaño admitido.' } }) }));
  const navigate = vi.fn(); renderFlow(navigate); fireEvent.click(screen.getAllByRole('button', { name: /Agregar al pedido/ })[0]);
  fireEvent.click(screen.getByRole('button', { name: /Enviar pedido por WhatsApp/ }));
  expect(await screen.findByText(/Los datos enviados superan/)).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Quitar Celular de prueba' })).toBeInTheDocument(); expect(navigate).not.toHaveBeenCalled();
});
it.each([200, 409])('descarta respuesta tardía %s si el comprador cambió el pedido', async status => {
  let finish; const navigate = vi.fn();
  vi.stubGlobal('fetch', vi.fn(() => new Promise(resolve => { finish = resolve; })));
  renderFlow(navigate); fireEvent.click(screen.getAllByRole('button', { name: /Agregar al pedido/ })[0]);
  fireEvent.click(screen.getByRole('button', { name: /Enviar pedido por WhatsApp/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad de Celular de prueba' }));
  finish({ ok: status === 200, status, json: async () => ({ error: { code: 'PRODUCTS_UNAVAILABLE' }, removedProductIds: [], whatsappUrl: 'https://wa.me/51900000000?text=anterior', items: [{ ...products[0], productId: products[0].id, quantity: 1 }], totalCents: 429900 }) });
  expect(await screen.findByText(/El pedido cambió/)).toBeInTheDocument(); expect(navigate).not.toHaveBeenCalled();
  expect(screen.getAllByText('S/ 8598.00').length).toBeGreaterThan(0); expect(JSON.parse(localStorage.getItem('chaska.order.v1')).items[0].quantity).toBe(2);
});
