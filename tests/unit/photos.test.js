import { it, expect } from 'vitest';
import sharp from 'sharp';
import { normalizePhoto } from '../../server/photos.js';
import { photo, corruptPhoto, paddedPhoto, largePng } from '../fixtures/photos.js';
it.each(['jpeg', 'png', 'webp'])('decodifica %s y normaliza a WebP sin ampliar', async format => {
  const buffer = await normalizePhoto(await photo(format)); const metadata = await sharp(buffer).metadata(); expect(metadata.format).toBe('webp'); expect(metadata.width).toBe(80); expect(metadata.exif).toBeUndefined();
});
it('reduce fotos a 1600 px por lado y retira metadatos', async () => {
  const input = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: '#999' } }).jpeg().withMetadata().toBuffer();
  const metadata = await sharp(await normalizePhoto(input)).metadata(); expect(metadata.width).toBe(1600); expect(metadata.exif).toBeUndefined();
});
it('rechaza corrupción y SVG aunque el MIME declare imagen', async () => {
  await expect(normalizePhoto(corruptPhoto)).rejects.toMatchObject({ code: 'INVALID_PHOTO' });
  await expect(normalizePhoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'))).rejects.toMatchObject({ code: 'INVALID_PHOTO' });
});
it('acepta 5 000 000 bytes y rechaza uno más', async () => {
  await expect(normalizePhoto(await paddedPhoto(5_000_000))).resolves.toBeInstanceOf(Buffer);
  let code; try { await normalizePhoto(await paddedPhoto(5_000_001)); } catch (error) { code = error.code; }
  expect(code).toBe('PHOTO_TOO_LARGE');
});
it('admite PNG válido bajo 5 MB sin un límite comercial adicional de píxeles', async () => {
  const input = await largePng(); expect(input.length).toBeLessThan(5_000_000);
  const output = await normalizePhoto(input); const metadata = await sharp(output).metadata(); expect(metadata.width).toBe(1600); expect(metadata.format).toBe('webp');
}, 30000);
