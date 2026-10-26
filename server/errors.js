export class AppError extends Error {
  constructor(status, code, message, fields) { super(message); this.status = status; this.code = code; this.fields = fields; }
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.status || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message;
  if (error.type === 'entity.too.large') { status = 413; code = 'REQUEST_TOO_LARGE'; message = 'Los datos enviados superan el tamaño admitido.'; }
  else if (error.type === 'entity.parse.failed') { status = 400; code = 'INVALID_JSON'; message = 'Los datos enviados no tienen un formato válido.'; }
  else if (error.type === 'encoding.unsupported') { status = 415; code = 'UNSUPPORTED_ENCODING'; message = 'Envía los datos sin compresión.'; }
  else if (!(error instanceof AppError)) {
    status = String(error.code).startsWith('ERR_SQLITE') || (error.code === 'ERR_INVALID_STATE' && /database/i.test(error.message)) ? 503 : 500;
    code = status === 503 ? 'STORAGE_UNAVAILABLE' : 'INTERNAL_ERROR';
    message = status === 503 ? 'No se pudo acceder a los productos. Intenta nuevamente.' : 'No se pudo completar la operación. Intenta nuevamente.';
  }
  res.status(status).json({ error: { code, message, ...(error.fields ? { fields: error.fields } : {}) } });
}
