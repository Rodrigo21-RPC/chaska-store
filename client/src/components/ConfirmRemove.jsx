import React, { useEffect, useRef } from 'react';
export default function ConfirmRemove({ product, busy, onCancel, onConfirm, error }) {
  const ref = useRef(null);
  const returnFocus = useRef(document.activeElement);
  useEffect(() => {
    const previous = returnFocus.current; const dialog = ref.current;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    return () => { if (typeof dialog.close === 'function') dialog.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog className="confirm-dialog" ref={ref} aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}><h2 id="confirm-title">¿Quitar producto?</h2><p id="confirm-description">Se retirará <strong>{product.name}</strong> del catálogo.</p>{error && <p role="alert" className="alert">{error}</p>}<div className="dialog-actions"><button className="button secondary" onClick={onCancel} disabled={busy} autoFocus>Cancelar</button><button className="button danger" onClick={onConfirm} disabled={busy}>{busy ? 'Quitando…' : 'Quitar producto'}</button></div></dialog>;
}
