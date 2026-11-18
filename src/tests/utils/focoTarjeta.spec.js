import { describe, test, expect } from "vitest";
import { moverFoco } from "../../utils/focoTarjeta";

describe("moverFoco", () => {
  test("guarda la posición del ratón relativa a la tarjeta", () => {
    const tarjeta = document.createElement("div");
    tarjeta.getBoundingClientRect = () => ({ left: 100, top: 50 });

    moverFoco({ currentTarget: tarjeta, clientX: 130, clientY: 90 });

    expect(tarjeta.style.getPropertyValue("--x")).toBe("30px");
    expect(tarjeta.style.getPropertyValue("--y")).toBe("40px");
  });

  test("no falla si el evento no trae tarjeta", () => {
    expect(() => moverFoco({ currentTarget: null })).not.toThrow();
  });
});
