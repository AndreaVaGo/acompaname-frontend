// Lee el texto de un archivo que ha elegido la persona.
// Los navegadores modernos tienen archivo.text(); si no existe, se usa FileReader
export function leerTexto(archivo) {
  if (typeof archivo.text === "function") {
    return archivo.text();
  }
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(new Error("No se pudo leer el archivo."));
    lector.readAsText(archivo);
  });
}
