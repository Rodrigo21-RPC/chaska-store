import sharp from 'sharp';
import { createDeflate } from 'node:zlib';
import { once } from 'node:events';
export const photo = async (format = 'webp') => sharp({ create: { width: 80, height: 80, channels: 3, background: '#497ed3' } }).toFormat(format).toBuffer();
export const corruptPhoto = Buffer.from('esto no es una foto');
export async function paddedPhoto(bytes) { const valid = await photo('jpeg'); return Buffer.concat([valid, Buffer.alloc(Math.max(0, bytes - valid.length))]); }
export async function largePng() {
  // PNG uniforme válido de 268 960 000 píxeles, comprimido a menos de 5 MB.
  // Se generan filas en streaming para no crear un bitmap gigante en el test.
  const width = 16400, height = 16400;
  const deflate = createDeflate(); const compressed = [];
  deflate.on('data', chunk => compressed.push(chunk));
  const end = once(deflate, 'end'); const row = Buffer.alloc(width * 3 + 1);
  for (let i = 0; i < height; i++) if (!deflate.write(row)) await once(deflate, 'drain');
  deflate.end(); await end;
  function chunk(type, body) {
    const label = Buffer.from(type), value = Buffer.concat([label, body]); let crc = 0xffffffff;
    for (const byte of value) { crc ^= byte; for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1; }
    const length = Buffer.alloc(4); length.writeUInt32BE(body.length); const checksum = Buffer.alloc(4); checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([length, value, checksum]);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', Buffer.concat(compressed)), chunk('IEND', Buffer.alloc(0))]);
}
