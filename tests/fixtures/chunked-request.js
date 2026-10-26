import { once } from 'node:events';
import request from 'supertest';
export async function chunkedPost(app, path, buffer, headers) {
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  try {
    const pending = request(server).post(path).set(headers);
    const middle = Math.floor(buffer.length / 2);
    pending.write(buffer.subarray(0, middle)); pending.write(buffer.subarray(middle));
    return await pending;
  } finally { await new Promise(resolve => server.close(resolve)); }
}
