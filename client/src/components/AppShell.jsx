import React from 'react';
import { Link, NavLink } from 'react-router-dom';
export default function AppShell({ children, count = 0 }) {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="site-header"><Link className="brand" to="/" translate="no"><span className="brand-mark">C</span><span>Chaska <b>Store</b><i aria-hidden="true">•</i></span></Link><Link className="admin-link" to="/admin">Administración</Link></header>
    <main id="contenido" className="store-main">{children}</main>
    <nav className="bottom-nav" aria-label="Navegación principal"><NavLink to="/" end><span aria-hidden="true">▤</span>Catálogo</NavLink><NavLink to="/mi-pedido"><span aria-hidden="true">▢</span>Mi pedido <span className="count" aria-label={`${count} unidades`}>{count}</span></NavLink></nav>
  </>;
}
