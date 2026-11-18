import { describe, test, expect, afterEach } from "vitest";
import pinia from "../../pinia/pinia";
import { useAuthStore } from "../../stores/auth";
import router from "../../router/index";

describe("rutas de recuperar la contraseña", () => {
  afterEach(() => {
    useAuthStore(pinia).logout();
  });

  test("/olvide-password se puede ver sin sesión", async () => {
    await router.push("/olvide-password");

    expect(router.currentRoute.value.name).toBe("olvide-password");
  });

  test("/restablecer-password se puede ver sin sesión y conserva el token", async () => {
    await router.push("/restablecer-password?token=abc");

    expect(router.currentRoute.value.name).toBe("restablecer-password");
    expect(router.currentRoute.value.query.token).toBe("abc");
  });

  test("las dos rutas tienen título para la pestaña", () => {
    expect(router.resolve("/olvide-password").meta.titulo).toBe("Recuperar contraseña");
    expect(router.resolve("/restablecer-password").meta.titulo).toBe("Elegir contraseña nueva");
  });

  test("las dos rutas no piden login ni rol", () => {
    expect(router.resolve("/olvide-password").meta.requiereLogin).toBeUndefined();
    expect(router.resolve("/restablecer-password").meta.requiereLogin).toBeUndefined();
  });
});
