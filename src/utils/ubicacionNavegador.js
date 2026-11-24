// Pide la ubicación al navegador UNA vez (no se sigue a la persona).
// El navegador enseña su propio aviso y la persona puede decir que no.
// Devuelve { latitud, longitud }, o rechaza si no hay permiso, no se puede
// obtener o el navegador no sabe de ubicación.
export function pedirUbicacion() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("UBICACION_NO_DISPONIBLE"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        resolve({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
        });
      },
      (error) => reject(error),
      // Sin guardar posiciones antiguas: tiene que ser la de ahora
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    );
  });
}
