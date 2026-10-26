export const ids = [1, 2, 3, 4, 5, 6].map(n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`);
export const products = [
  { id: ids[0], name: 'Celular de prueba', category: 'Celulares', priceCents: 429900 },
  { id: ids[1], name: 'Accesorio de prueba', category: 'Accesorios', priceCents: 32900 },
  { id: ids[2], name: 'Laptop de prueba', category: 'Laptops', priceCents: 359900 },
  { id: ids[3], name: 'Samsung de prueba', category: 'Celulares', priceCents: 289900 },
  { id: ids[4], name: 'Audífonos de prueba', category: 'Accesorios', priceCents: 4990 },
  { id: ids[5], name: 'Laptop Pro de prueba', category: 'Laptops', priceCents: 519900 },
].map(product => ({ ...product, photoUrl: `/api/products/${product.id}/photo`, description: 'Descripción completa del producto.\nSegunda línea.', specifications: 'Memoria: 256 GB\nConectividad: Wi-Fi' }));
export function seedProducts(db, photo) {
  const statement = db.prepare('INSERT INTO products (id,name,category,priceCents,description,specifications,photo,createdAt) VALUES (?,?,?,?,?,?,?,?)');
  products.forEach((p, i) => statement.run(p.id, p.name, p.category, p.priceCents, p.description, p.specifications, photo, `2026-10-26T12:00:0${i}.000Z`));
}
