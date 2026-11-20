import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de cristal en Solicitar servicio, Pago y Mi perfil profesional
const pantallas = [
  { nombre: "SolicitarServicioView", ruta: "src/views/family/SolicitarServicioView.vue", clase: "solicitar" },
  { nombre: "CheckoutView", ruta: "src/views/family/CheckoutView.vue", clase: "checkout" },
  { nombre: "EditarPerfilView", ruta: "src/views/caregiver/EditarPerfilView.vue", clase: "editar" },
];

describe.each(pantallas)("$nombre · diseño de cristal", ({ ruta, clase }) => {
  const fuente = readFileSync(ruta, "utf-8");

  test("usa el fondo animado y la tarjeta de cristal globales", () => {
    expect(fuente).toContain(`class="${clase} pantalla"`);
    expect(fuente).toContain(`class="${clase}__box tarjeta-cristal"`);
  });

  test("el contenedor no pone fondo propio", () => {
    const inicio = fuente.indexOf(`.${clase} {`);
    const bloque = fuente.slice(inicio, fuente.indexOf("}", inicio));

    expect(bloque).not.toContain("background-color");
  });

  test("la tarjeta con formulario no se levanta ni brilla al pasar el ratón", () => {
    const bloque = fuente.slice(fuente.indexOf(`.${clase}__box:hover`));

    expect(bloque.slice(0, 100)).toContain("transform: none");
    expect(fuente).toContain(`.${clase}__box::after`);
  });
});
