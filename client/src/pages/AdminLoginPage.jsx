import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { usePageTitle } from '../useResource.js';
import Icon from '../components/Icon.jsx';
export default function AdminLoginPage() {
  usePageTitle('Acceso de administrador');
  const navigate = useNavigate(); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const flight = useRef(false);
  async function submit(event) { event.preventDefault(); if (flight.current) return; flight.current = true; setBusy(true); setError(''); try { await api('/api/admin/session', { method: 'POST', body: { password } }); navigate('/admin', { replace: true }); } catch (error) { setError(error.message); } finally { flight.current = false; setBusy(false); } }
  return <div className="login-wrap"><section className="login-card"><div className="login-icon"><Icon name="user" /></div><h1>Acceso de<br />administrador</h1><p>Ingresa tu clave para administrar los productos de Chaska Store.</p><form onSubmit={submit} noValidate><label htmlFor="admin-password">Clave del administrador</label><input id="admin-password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} aria-describedby={error ? 'login-error' : undefined} aria-invalid={!!error} />{error && <p id="login-error" className="alert" role="alert">{error}</p>}<button className="button" type="submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button></form><Link className="continue-link" to="/">Volver al catálogo</Link></section></div>;
}
