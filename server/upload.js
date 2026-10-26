import express from 'express';
import multer from 'multer';
import { Readable } from 'node:stream';
import { AppError } from './errors.js';
const receive = express.raw({ type: () => true, limit: 5_100_000, inflate: false });
const parse = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5_000_001, fieldSize: 20_001, fields: 5, files: 1, parts: 7, fieldNameSize: 32 } }).single('photo');
export function receiveUpload(req, res, next) {
  if (!req.is('multipart/form-data')) return next(new AppError(400, 'INVALID_UPLOAD', 'Envía un formulario con una sola foto.'));
  receive(req, res, error => {
    if (error) return next(error);
    const stream = Readable.from([req.body]); stream.headers = req.headers;
    parse(stream, res, error => {
      if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') return next(new AppError(413, 'PHOTO_TOO_LARGE', 'La foto admite hasta 5 MB.', { photo: 'La foto admite hasta 5 MB.' }));
        if (error.code === 'LIMIT_FIELD_VALUE') return next(new AppError(413, 'FIELD_TOO_LARGE', 'Un campo supera los 20 000 bytes admitidos.', error.field ? { [error.field]: 'El texto enviado es demasiado grande.' } : undefined));
        return next(new AppError(400, 'INVALID_UPLOAD', 'Envía los cinco campos y una sola foto válida.'));
      }
      req.body = stream.body; req.file = stream.file;
      if (req.file?.size > 5_000_000) return next(new AppError(413, 'PHOTO_TOO_LARGE', 'La foto admite hasta 5 MB.', { photo: 'La foto admite hasta 5 MB.' }));
      for (const [name, value] of Object.entries(req.body)) {
        if (typeof value !== 'string') return next(new AppError(400, 'INVALID_UPLOAD', 'No repitas los campos del formulario.'));
        if (Buffer.byteLength(value, 'utf8') > 20_000) return next(new AppError(413, 'FIELD_TOO_LARGE', 'Un campo supera los 20 000 bytes admitidos.', { [name]: 'El texto enviado es demasiado grande.' }));
      }
      next();
    });
  });
}
