import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { orderReducer, summarize } from './reducer.js';
import { loadOrder, saveOrder } from './storage.js';
export const OrderContext = createContext(null);
export function useOrder() { return useContext(OrderContext); }
export default function OrderProvider({ children }) {
  const [initial] = useState(() => loadOrder()); const [items, setItems] = useState(initial.items);
  const currentItems = useRef(items); currentItems.current = items;
  const revision = useRef(0);
  const [notice, setNotice] = useState(''); const [warning, setWarning] = useState(initial.warning);
  useEffect(() => { const error = saveOrder(items); if (error) setWarning(error); }, [items]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timer); }, [notice]);
  function dispatch(action) { try { const next = orderReducer(currentItems.current, action); currentItems.current = next; revision.current += 1; setItems(next); if (action.type === 'add') setNotice(`${action.product.name} agregado al pedido.`); } catch (error) { setNotice(error.message); } }
  return <OrderContext.Provider value={{ items, ...summarize(items), getRevision: () => revision.current, notice, warning, add: product => dispatch({ type: 'add', product }), change: (id, quantity) => dispatch({ type: 'change', id, quantity }), remove: id => dispatch({ type: 'remove', id }), reconcile: lines => dispatch({ type: 'reconcile', items: lines }) }}>
    {notice && <div className="toast" role="status">{notice}</div>}{warning && <p className="storage-warning" role="alert">{warning}</p>}{children}
  </OrderContext.Provider>;
}
