export function filterProducts(products, query = '', category = 'Todos') {
  const search = query.trim().toLocaleLowerCase('es-PE');
  return products.filter(p => (category === 'Todos' || p.category === category) && p.name.toLocaleLowerCase('es-PE').includes(search));
}
