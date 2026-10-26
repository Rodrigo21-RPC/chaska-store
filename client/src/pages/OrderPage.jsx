import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../order/OrderProvider.jsx';
import { saveOrder } from '../order/storage.js';
import { formatMoney } from '../../../shared/money.js';
import { api } from '../api.js';
import { usePageTitle } from '../useResource.js';
import { Photo, Feedback } from '../components/Feedback.jsx';
import Icon from '../components/Icon.jsx';
export default function OrderPage({ navigate = url => window.location.assign(url) }) {
  usePageTitle('Mi pedido');
  const order = useOrder(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function send() {
    if (busy || !order.items.length) return;
    const revision = order.getRevision();
    function current() { if (!active.current) return false; if (revision !== order.getRevision()) { setMessage('El pedido cambió mientras se preparaba. Revísalo y vuelve a enviar.'); return false; } return true; }
    setBusy(true); setMessage('');
    try {
      const data = await api('/api/order/preview', { method: 'POST', body: { items: order.items.map(item => ({ productId: item.productId, quantity: item.quantity })) } });
      if (!current()) return;
      const error = saveOrder(order.items); if (error) { setMessage(error); return; }
      navigate(data.whatsappUrl);
    } catch (error) {
      if (!current()) return;
      if (error.status === 409) { const names = order.items.filter(item => error.body.removedProductIds.includes(item.productId)).map(item => item.name); order.reconcile(error.body.items); setMessage(`Ya no disponible: ${names.join(', ')}. Revisa el pedido y vuelve a enviar.`); }
      else setMessage(error.message);
    } finally { if (active.current) setBusy(false); }
  }
  return <div className="order-page"><h1>Mi pedido</h1>{message && <p className="alert" role="alert">{message}</p>}{!order.items.length ? <Feedback title="Tu pedido está vacío" action={<Link className="button" to="/">Explorar catálogo</Link>}>Agrega los productos que te interesan y coordina tu compra por WhatsApp.</Feedback> : <><div className="order-items">{order.lines.map(item => <article className="order-line" key={item.productId}><Photo src={item.photoUrl} name={item.name} /><div className="order-line-info"><h2>{item.name}</h2><p className="price">{formatMoney(item.subtotalCents)}</p><p className="unit-price">{formatMoney(item.priceCents)} c/u</p></div><div className="order-controls"><button className="text-button" aria-label={`Quitar ${item.name}`} onClick={() => order.remove(item.productId)}>Quitar</button><div className="quantity"><button aria-label={`Disminuir cantidad de ${item.name}`} disabled={item.quantity <= 1} onClick={() => order.change(item.productId, item.quantity - 1)}>−</button><output aria-label={`Cantidad de ${item.name}`}>{item.quantity}</output><button aria-label={`Aumentar cantidad de ${item.name}`} onClick={() => order.change(item.productId, item.quantity + 1)}>+</button></div></div></article>)}</div><section className="order-summary"><h2>Resumen de compra</h2><div><strong>Total</strong><strong className="price">{formatMoney(order.totalCents)}</strong></div></section><button className="button whatsapp-button" onClick={send} disabled={busy}><Icon name="whatsapp" />{busy ? 'Preparando pedido…' : 'Enviar pedido por WhatsApp'}</button><p className="order-disclaimer">Tu pedido se coordina por WhatsApp. No se realiza ningún pago en esta página.</p><Link className="continue-link" to="/">Seguir viendo productos</Link></>}</div>;
}
