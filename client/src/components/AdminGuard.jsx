import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useResource } from '../useResource.js';
import { Loading, ErrorState } from './Feedback.jsx';
export default function AdminGuard({ children }) {
  const resource = useResource('/api/admin/session');
  const authorized = useRef(false);
  if (resource.data?.authenticated) authorized.current = true;
  useEffect(() => {
    const check = () => resource.retry();
    const visible = () => { if (document.visibilityState === 'visible') check(); };
    window.addEventListener('focus', check); window.addEventListener('pageshow', check); window.addEventListener('chaska:logout', check); document.addEventListener('visibilitychange', visible);
    return () => { window.removeEventListener('focus', check); window.removeEventListener('pageshow', check); window.removeEventListener('chaska:logout', check); document.removeEventListener('visibilitychange', visible); };
  }, [resource.retry]);
  if (resource.error?.status === 401) return <Navigate to="/admin/acceso" replace />;
  return <>{resource.loading && <Loading />}{resource.error && <ErrorState error={resource.error} retry={resource.retry} />}<div hidden={resource.loading || !!resource.error}>{authorized.current ? children || <Outlet /> : null}</div></>;
}
