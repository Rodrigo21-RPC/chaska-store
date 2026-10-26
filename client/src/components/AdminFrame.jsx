import React from 'react';
import { Link } from 'react-router-dom';
export default function AdminFrame({ children }) { return <div className="admin-layout"><a className="skip-link" href="#contenido">Saltar al contenido</a><header className="admin-header"><Link className="admin-brand" to="/" translate="no">Chaska Store</Link><Link className="admin-catalog-link" to="/">Ver catálogo ↗</Link></header><main id="contenido" className="admin-main">{children}</main></div>; }
