import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
export function useResource(path) {
  const [state, setState] = useState({ loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ loading: true });
    api(path).then(data => { if (active) setState({ data, loading: false }); }, error => { if (active) setState({ error, loading: false }); });
    return () => { active = false; };
  }, [path, attempt]);
  const retry = useCallback(() => { setState({ loading: true }); setAttempt(n => n + 1); }, []);
  return { ...state, retry };
}
export function usePageTitle(title) { useEffect(() => { document.title = `${title} | Chaska Store`; }, [title]); }
