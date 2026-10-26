import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useResource, usePageTitle } from '../useResource.js';
import { formatMoney } from '../../../shared/money.js';
import { Photo, Loading, ErrorState, Feedback } from '../components/Feedback.jsx';
import Icon from '../components/Icon.jsx';
import AddToOrder from '../components/AddToOrder.jsx';
export default function ProductDetailPage() {
  const { id } = useParams(); const location = useLocation();
  const resource = useResource(`/api/products/${id}`);
  usePageTitle(resource.data?.product?.name || 'Detalle de producto');
  if (resource.loading) return <Loading />;
  if (resource.error?.status === 404) return <Feedback title="Producto no disponible" action={<Link className="button" to="/">Volver al catálogo</Link>}>Este producto ya no forma parte del catálogo.</Feedback>;
  if (resource.error) return <ErrorState error={resource.error} retry={resource.retry} />;
  const product = resource.data.product;
  return <><div className="detail-toolbar"><Link className="back-link" to={`/${location.search}`}><Icon name="arrow" />Volver</Link><span className="store-badge">● CHASKA STORE</span></div><article className="detail-layout"><div className="detail-photo"><Photo src={product.photoUrl} name={product.name} loading="eager" /></div><div className="detail-info"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="price detail-price">{formatMoney(product.priceCents)}</p><section className="description"><h2 className="sr-only">Descripción</h2><p>{product.description}</p></section><section className="specifications"><h2>Especificaciones</h2><p>{product.specifications}</p></section></div></article><div className="detail-action"><AddToOrder product={product} /></div></>;
}
