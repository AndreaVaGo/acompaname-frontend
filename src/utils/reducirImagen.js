// Reduce una imagen a un tamaño pequeño y la devuelve como texto (Base64),
// para poder guardarla en el campo "foto" del perfil.
const TAMANO_MAXIMO = 300;

export function reducirImagen(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onerror = () => reject(new Error("No se pudo leer la imagen"));

    lector.onload = () => {
      const imagen = new Image();

      imagen.onerror = () => reject(new Error("No se pudo abrir la imagen"));

      imagen.onload = () => {
        const escala = Math.min(
          1,
          TAMANO_MAXIMO / Math.max(imagen.width, imagen.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(imagen.width * escala);
        canvas.height = Math.round(imagen.height * escala);

        const dibujo = canvas.getContext("2d");
        dibujo.fillStyle = "#ffffff";
        dibujo.fillRect(0, 0, canvas.width, canvas.height);
        dibujo.drawImage(imagen, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      imagen.src = lector.result;
    };

    lector.readAsDataURL(archivo);
  });
}