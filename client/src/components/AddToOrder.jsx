import React from 'react';
import { useOrder } from '../order/OrderProvider.jsx';
import Icon from './Icon.jsx';
export default function AddToOrder({ product }) {
  const order = useOrder(); if (!order) return null;
  return <button className="button add-button" onClick={() => order.add(product)} aria-label={`Agregar al pedido: ${product.name}`}><Icon name="cart" /><span>Agregar al pedido</span></button>;
}
