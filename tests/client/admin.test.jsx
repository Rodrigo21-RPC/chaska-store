import React from 'react';
import { afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminGuard from '../../client/src/components/AdminGuard.jsx';
import AdminLoginPage from '../../client/src/pages/AdminLoginPage.jsx';
import AdminPanelPage from '../../client/src/pages/AdminPanelPage.jsx';
import AddProductPage from '../../client/src/pages/AddProductPage.jsx';
import { products } from '../fixtures/products.js';
afterEach(() => vi.unstubAllGlobals());
const mount = page => render(<MemoryRouter>{page}</MemoryRouter>);
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
it('oculta contenido privado y exige acceso si el servidor devuelve 401', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ error: { message: 'Ingresa la clave.' } }, 401)));
  mount(<Routes><Route path="/" element={<AdminGuard><h1>Contenido privado</h1></AdminGuard>} /><Route path="/admin/acceso" element={<h1>Acceso requerido</h1>} /></Routes>);
  expect(await screen.findByRole('heading', { name: 'Acceso requerido' })).toBeInTheDocument();
  expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
});
it('conserva el borrador cuando revalida sesión al volver el foco', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ authenticated: true })));
  mount(<AdminGuard><label>Borrador<input defaultValue="" /></label></AdminGuard>);
  const input = await screen.findByRole('textbox', { name: 'Borrador' });
  fireEvent.change(input, { target: { value: 'Texto sin guardar' } });
  fireEvent(window, new Event('focus'));
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Borrador' })).toHaveValue('Texto sin guardar'));
});
it('muestra clave oculta y error de acceso sin revelar credenciales', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ error: { message: 'La clave no es correcta.' } }, 401)));
  mount(<AdminLoginPage />);
  expect(screen.queryByLabelText('Clave del administrador')).toHaveAttribute('type', 'password');
  fireEvent.change(screen.getByLabelText('Clave del administrador'), { target: { value: 'incorrecta' } }); fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('La clave no es correcta.');
});
it('panel muestra productos y cancelar retirada no muta', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ products: [products[0]] })));
  mount(<AdminPanelPage />); await screen.findByText(products[0].name);
  fireEvent.click(screen.getByRole('button', { name: `Quitar ${products[0].name}` }));
  expect(screen.getByRole('dialog')).toHaveTextContent(products[0].name);
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(fetch).toHaveBeenCalledTimes(1);
});
it('formulario muestra máximos y valida campos sin perder textos', async () => {
  mount(<AddProductPage />);
  expect(screen.queryByLabelText('Nombre')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'n'.repeat(201) } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
  expect(await screen.findByText(/El nombre admite hasta 200/)).toBeInTheDocument();
  expect(screen.getByLabelText('Nombre')).toHaveValue('n'.repeat(201)); expect(screen.getAllByText(/5000 caracteres/)).toHaveLength(2);
});
it('alta conserva texto ante 413 y no repite el envío en curso', async () => {
  let finish; vi.stubGlobal('fetch', vi.fn(() => new Promise(resolve => { finish = resolve; })));
  mount(<AddProductPage />);
  for (const [label, value] of [['Nombre', 'Producto'], ['Precio (S/)', '49.90'], ['Descripción', 'Descripción'], ['Especificaciones', 'USB']]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.change(screen.getByLabelText('Foto'), { target: { files: [new File(['foto'], 'foto.png', { type: 'image/png' })] } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); expect(screen.getByRole('button', { name: /Guardando producto/ })).toBeDisabled();
  finish(response({ error: { message: 'Los datos enviados superan el tamaño admitido.' } }, 413));
  expect(await screen.findByRole('alert')).toHaveTextContent(/superan el tamaño/); expect(screen.getByLabelText('Nombre')).toHaveValue('Producto');
});
