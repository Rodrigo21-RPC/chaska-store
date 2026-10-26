import React from 'react';
import AppShell from './components/AppShell.jsx';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import OrderProvider, { useOrder } from './order/OrderProvider.jsx';
import OrderPage from './pages/OrderPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import AdminFrame from './components/AdminFrame.jsx';
import AdminGuard from './components/AdminGuard.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminPanelPage from './pages/AdminPanelPage.jsx';
import AddProductPage from './pages/AddProductPage.jsx';
function AppContent() {
  const order = useOrder(); const location = useLocation();
  if (location.pathname.startsWith('/admin')) return <AdminFrame><Routes><Route path="/admin/acceso" element={<AdminLoginPage />} /><Route element={<AdminGuard />}><Route path="/admin" element={<AdminPanelPage />} /><Route path="/admin/productos/nuevo" element={<AddProductPage />} /></Route><Route path="*" element={<p>Esta sección no existe. <Link to="/admin">Volver al panel</Link></p>} /></Routes></AdminFrame>;
  return <AppShell count={order.count}><Routes><Route path="/" element={<CatalogPage />} /><Route path="/mi-pedido" element={<OrderPage />} /><Route path="/productos/:id" element={<ProductDetailPage />} /><Route path="*" element={<p>Esta sección no existe. <Link to="/">Volver al catálogo</Link></p>} /></Routes></AppShell>;
}

export default function App() { return <OrderProvider><AppContent /></OrderProvider>; }
