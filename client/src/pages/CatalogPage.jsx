import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../../../shared/validation.js';
import { useResource, usePageTitle } from '../useResource.js';
import { filterProducts } from './catalog-state.js';
import ProductCard from '../components/ProductCard.jsx';
import Icon from '../components/Icon.jsx';
import { Feedback, Loading, ErrorState } from '../components/Feedback.jsx';
export default function CatalogPage() {
  usePageTitle('Catálogo');
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = categories.includes(params.get('categoria')) ? params.get('categoria') : 'Todos';
  const resource = useResource('/api/products');
  function setFilter(key, value) { const next = new URLSearchParams(params); value && value !== 'Todos' ? next.set(key, value) : next.delete(key); setParams(next, { replace: true }); }
  const visible = filterProducts(resource.data?.products || [], query, category);
  const search = params.toString() ? `?${params}` : '';
  return <>
    <div className="page-heading"><div><p className="eyebrow">TECNOLOGÍA A TU ALCANCE</p><h1>Catálogo</h1></div><Link className="order-shortcut" to="/mi-pedido"><Icon name="bag" />Mi pedido</Link></div>
    <label className="search-field"><Icon name="search" /><span className="sr-only">Buscar productos por nombre</span><input type="search" name="q" placeholder="Buscar celulares, laptops…" value={query} onChange={event => setFilter('q', event.target.value)} /></label>
    <div className="filters" aria-label="Categorías">{['Todos', ...categories].map(item => <button key={item} className={item === category ? 'filter active' : 'filter'} aria-pressed={item === category} onClick={() => setFilter('categoria', item)}>{item}</button>)}</div>
    {resource.loading ? <Loading /> : resource.error ? <ErrorState error={resource.error} retry={resource.retry} /> : !resource.data.products.length ? <Feedback title="Todavía no hay productos">Pronto encontrarás aquí nuestros productos electrónicos.</Feedback> : !visible.length ? <Feedback title="No encontramos productos" action={<button className="button secondary" onClick={() => setParams({})}>Limpiar filtros</button>}>Prueba otro nombre o categoría.</Feedback> : <div className="product-grid">{visible.map(product => <ProductCard key={product.id} product={product} search={search} />)}</div>}
  </>;
}
