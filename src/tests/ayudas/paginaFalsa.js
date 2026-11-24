// Una página como la que devuelve el servidor, para los tests de las listas por páginas.
// Por defecto es la única página; con "extra" se cambia lo que haga falta (totalPaginas, pagina...)
export function pagina(lista, extra) {
  return {
    contenido: lista,
    pagina: 0,
    tamano: 20,
    totalElementos: lista.length,
    totalPaginas: 1,
    ...extra,
  };
}
