import { describe, test, expect, vi, afterEach } from "vitest";
import { pedirUbicacion } from "../../utils/ubicacionNavegador";

afterEach(() => {
  vi.unstubAllGlobals();
});

function navegadorCon(geolocation) {
  vi.stubGlobal("navigator", { geolocation: geolocation });
}

describe("pedirUbicacion", () => {
  test("devuelve la latitud y la longitud (y nada más)", async () => {
    navegadorCon({
      getCurrentPosition: (ok) =>
        ok({ coords: { latitude: 43.36, longitude: -5.85, accuracy: 20 } }),
    });

    const ubicacion = await pedirUbicacion();

    expect(ubicacion).toEqual({ latitud: 43.36, longitud: -5.85 });
  });

  test("pide una posición actual, sin guardar posiciones antiguas", async () => {
    const getCurrentPosition = vi.fn((ok) =>
      ok({ coords: { latitude: 1, longitude: 2 } }),
    );
    navegadorCon({ getCurrentPosition });

    await pedirUbicacion();

    expect(getCurrentPosition.mock.calls[0][2].maximumAge).toBe(0);
  });

  test("rechaza si la persona no da permiso", async () => {
    navegadorCon({
      getCurrentPosition: (ok, fallo) => fallo({ code: 1 }),
    });

    await expect(pedirUbicacion()).rejects.toMatchObject({ code: 1 });
  });

  test("rechaza si el navegador no sabe de ubicación", async () => {
    navegadorCon(undefined);

    await expect(pedirUbicacion()).rejects.toThrow("UBICACION_NO_DISPONIBLE");
  });
});
