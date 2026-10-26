import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productInputSchema, categories, fieldErrors } from '../../../shared/validation.js';
import { api } from '../api.js';
import { usePageTitle } from '../useResource.js';
import Icon from '../components/Icon.jsx';
const defaults = { name: '', category: 'Celulares', price: '', description: '', specifications: '' };
export default function AddProductPage() {
  usePageTitle('Agregar producto'); const navigate = useNavigate();
  const [values, setValues] = useState(defaults); const [file, setFile] = useState(null); const [preview, setPreview] = useState(''); const [errors, setErrors] = useState({}); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const flight = useRef(false);
  const dirty = values !== defaults || file !== null;
  useEffect(() => { if (!file || typeof URL.createObjectURL !== 'function') { setPreview(''); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  useEffect(() => { const warn = event => { if (dirty && !flight.current) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  function change(event) { setValues(current => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); if (flight.current) return;
    setMessage(''); const parsed = productInputSchema.safeParse(values); const invalid = parsed.success ? {} : fieldErrors(parsed.error);
    if (!file) invalid.photo = 'Selecciona una foto JPG, PNG o WebP.'; else if (file.size > 5_000_000) invalid.photo = 'La foto admite hasta 5 MB.';
    if (Object.keys(invalid).length) { setErrors(invalid); document.getElementById(Object.keys(invalid)[0])?.focus(); return; }
    setErrors({}); flight.current = true; setBusy(true);
    const form = new FormData(); for (const [name, value] of Object.entries(parsed.data)) form.append(name, value); form.append('photo', file);
    try { const result = await api('/api/admin/products', { method: 'POST', body: form }); navigate('/admin', { state: { notice: `${result.product.name} se publicó correctamente.` } }); }
    catch (error) { if (error.status === 401) navigate('/admin/acceso', { replace: true }); else { setErrors(error.fields || {}); setMessage(error.status === 0 ? 'No se pudo confirmar el guardado. Revisa el panel antes de volver a intentar; tus textos se conservan aquí.' : error.message); document.getElementById(Object.keys(error.fields || {})[0])?.focus(); } }
    finally { flight.current = false; setBusy(false); }
  }
  function textField(name, label, multiline = false, hint = '') {
    const props = { id: name, name, value: values[name], onChange: change, 'aria-invalid': !!errors[name], 'aria-describedby': [hint ? `${name}-hint` : '', errors[name] ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined };
    return <div className={`form-field ${multiline ? 'full-width' : ''}`}><label htmlFor={name}>{label}</label>{multiline ? <textarea {...props} rows={name === 'description' ? 4 : 3} placeholder={name === 'description' ? 'Escribe la descripción general del producto…' : 'Memoria, procesador, conectividad…'} /> : <input {...props} type="text" inputMode={name === 'price' ? 'decimal' : 'text'} autoComplete="off" placeholder={name === 'price' ? '0.00' : 'Ej. iPhone 15 Pro o MacBook Air…'} />}{hint && <small id={`${name}-hint`}>{hint}</small>}{errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}</div>;
  }
  return <><div className="admin-heading"><h1>Agregar producto</h1></div><form className="product-form" onSubmit={submit} noValidate onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); event.currentTarget.requestSubmit(); } }}>
    {message && <p className="alert full-width" role="alert">{message}</p>}
    {textField('name', 'Nombre', false, 'Hasta 200 caracteres Unicode.')}
    <div className="form-field"><label htmlFor="category">Categoría</label><select id="category" name="category" value={values.category} onChange={change}>{categories.map(category => <option key={category}>{category}</option>)}</select>{errors.category && <p className="field-error">{errors.category}</p>}</div>
    <div className="full-width">{textField('price', 'Precio (S/)')}</div>
    {textField('description', 'Descripción', true, 'Hasta 5000 caracteres Unicode.')}
    {textField('specifications', 'Especificaciones', true, 'Hasta 5000 caracteres Unicode.')}
    <div className="form-field full-width"><label htmlFor="photo">Foto</label><div className="photo-upload"><Icon name="upload" /><p>Formatos admitidos: JPG, PNG, WebP · hasta 5 MB</p><input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0] || null)} aria-invalid={!!errors.photo} aria-describedby={errors.photo ? 'photo-error' : undefined} />{preview && <img src={preview} alt="Vista previa de la foto" width="160" height="160" />}</div>{errors.photo && <p className="field-error" id="photo-error">{errors.photo}</p>}</div>
    <div className="form-actions full-width"><Link className="button secondary" to="/admin">Cancelar</Link><button className="button" type="submit" disabled={busy}>{busy ? 'Guardando producto…' : 'Guardar producto'}</button></div>
  </form></>;
}
