import React from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../../shared/money.js';
import { Photo } from './Feedback.jsx';
import AddToOrder from './AddToOrder.jsx';
export default function ProductCard({ product, search = '' }) {
  return <article className="product-card"><Link className="product-link" to={`/productos/${product.id}${search}`}><Photo src={product.photoUrl} name={product.name} alt="" /><h2>{product.name}</h2></Link><p className="price">{formatMoney(product.priceCents)}</p><AddToOrder product={product} /></article>;
}
