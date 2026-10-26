import React from 'react';
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../client/src/App.jsx';
it('muestra marca y navegación con enlaces reales', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.queryAllByRole('link', { name: /Catálogo/ }).length).toBeGreaterThan(0);
  expect(screen.queryByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/admin');
});
