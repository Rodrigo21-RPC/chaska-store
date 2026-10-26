import React from 'react';
import Icon from './Icon.jsx';
export function Feedback({ title, children, action }) { return <section className="feedback"><Icon name="bag" /><h2>{title}</h2>{children && <p>{children}</p>}{action}</section>; }
export function Loading() { return <p className="loading" role="status">Cargando productos…</p>; }
export function ErrorState({ error, retry }) { return <section className="feedback" role="alert"><h2>No pudimos cargar la información</h2><p>{error.message}</p><button className="button secondary" onClick={retry}>Reintentar</button></section>; }
export function Photo({ src, name, ...props }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  return failed ? <div className={`photo-placeholder ${props.className || ''}`} role="img" aria-label={`Foto no disponible: ${name}`}><Icon name="bag" /><span>Foto no disponible</span></div> : <img src={src} alt={props.alt ?? name} width="640" height="640" loading="lazy" {...props} onError={() => setFailed(true)} />;
}
