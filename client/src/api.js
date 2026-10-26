export class ApiError extends Error {
  constructor(status, body) { super(body?.error?.message || 'No se pudo completar la operación. Intenta nuevamente.'); this.status = status; this.code = body?.error?.code; this.fields = body?.error?.fields; this.body = body; }
}
export async function api(path, options = {}) {
  const { body, ...rest } = options;
  const isForm = body instanceof FormData;
  let response;
  try { response = await fetch(path, { credentials: 'same-origin', ...rest, ...(body === undefined ? {} : { body: isForm ? body : JSON.stringify(body) }), headers: { ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}), ...options.headers } }); }
  catch { throw new ApiError(0, { error: { message: 'No hay conexión con la tienda. Intenta nuevamente.' } }); }
  if (response.status === 204) return null;
  let data; try { data = await response.json(); } catch { throw new ApiError(response.status); }
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}
