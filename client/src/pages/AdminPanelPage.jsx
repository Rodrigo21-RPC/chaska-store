import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { useResource, usePageTitle } from '../useResource.js';
import { formatMoney } from '../../../shared/money.js';
import { Photo, Loading, ErrorState, Feedback } from '../components/Feedback.jsx';
import ConfirmRemove from '../components/ConfirmRemove.jsx';
export default function AdminPanelPage() {
  usePageTitle('Panel de administración'); const navigate = useNavigate(); const location = useLocation();
  const resource = useResource('/api/admin/products'); const [selected, setSelected] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState(location.state?.notice || '');
  useEffect(() => { if (resource.error?.status === 401) navigate('/admin/acceso', { replace: true }); }, [resource.error, navigate]);
  async function remove() {
    if (busy) return; setBusy(true); setError('');
    try { await api(`/api/admin/products/${selected.id}`, { method: 'DELETE' }); setNotice(`${selected.name} se retiró del catálogo.`); setSelected(null); resource.retry(); }
    catch (error) { if (error.status === 401) navigate('/admin/acceso', { replace: true }); else setError(error.message); } finally { setBusy(false); }
  }
  async function logout() { if (busy) return; setBusy(true); try { await api('/api/admin/session', { method: 'DELETE' }); window.dispatchEvent(new Event('chaska:logout')); navigate('/admin/acceso', { replace: true }); } catch (error) { setError(error.message); } finally { setBusy(false); } }
  return <><div className="admin-heading"><h1>Panel de administración</h1><div className="admin-actions"><Link className="button" to="/admin/productos/nuevo">Agregar producto</Link><button className="text-button" disabled={busy} onClick={logout}>Cerrar sesión</button></div></div>{notice && <p className="success-message" role="status">{notice}</p>}{error && !selected && <p className="alert" role="alert">{error}</p>}{resource.loading ? <Loading /> : resource.error?.status === 401 ? null : resource.error ? <ErrorState error={resource.error} retry={resource.retry} /> : !resource.data.products.length ? <Feedback title="Todavía no hay productos" action={<Link className="button" to="/admin/productos/nuevo">Agregar producto</Link>}>Agrega tu primer producto para publicarlo en el catálogo.</Feedback> : <div className="table-container"><table><caption className="sr-only">Productos del catálogo</caption><thead><tr>{['Foto', 'Nombre', 'Categoría', 'Precio', 'Acción'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{resource.data.products.map(product => <tr key={product.id}><td><Photo src={product.photoUrl} name={product.name} alt="" /></td><td className="product-name-cell">{product.name}</td><td>{product.category}</td><td className="table-price">{formatMoney(product.priceCents)}</td><td><button className="button danger" aria-label={`Quitar ${product.name}`} onClick={() => { setError(''); setSelected(product); }}>Quitar</button></td></tr>)}</tbody></table></div>}{selected && <ConfirmRemove product={selected} busy={busy} error={error} onCancel={() => { setSelected(null); setError(''); }} onConfirm={remove} />}</>;
}
