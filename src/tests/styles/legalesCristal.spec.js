import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de cristal en las páginas legales y en la 404
const legales = [
  { nombre: "AvisoLegalView", ruta: "src/views/common/AvisoLegalView.vue" },
  { nombre: "PrivacidadView", ruta: "src/views/common/PrivacidadView.vue" },
  { nombre: "TerminosView", ruta: "src/views/common/TerminosView.vue" },
];

describe.each(legales)("$nombre · diseño de cristal", ({ ruta }) => {
  const fuente = readFileSync(ruta, "utf-8");

  test("el texto va en una tarjeta de cristal dentro de un contenedor con el fondo animado", () => {
    // El fondo animado va en un contenedor aparte: la tarjeta tiene backdrop-filter y recortaría el fondo fijo
    expect(fuente).toContain('<div class="pantalla">');
    expect(fuente).toContain('<div class="legal tarjeta-cristal">');
  });

  test("la tarjeta no pone fondo propio ni se levanta al pasar el ratón", () => {
    const inicio = fuente.indexOf(".legal {");
    const bloque = fuente.slice(inicio, fuente.indexOf("\n}", inicio));

    expect(bloque).not.toContain("background-color");
    expect(fuente).toContain(".legal:hover");
    expect(fuente).toContain(".legal::after");
  });
});

describe("NoEncontradoView · diseño", () => {
  const fuente = readFileSync("src/views/common/NoEncontradoView.vue", "utf-8");

  test("usa el fondo animado y la brújula se balancea", () => {
    expect(fuente).toContain('class="no-encontrado pantalla"');
    expect(fuente).toContain("@keyframes brujula");
  });

  test("el 404 lleva un degradado coral y verde", () => {
    expect(fuente).toContain("linear-gradient(135deg, var(--color-accent), var(--color-secondary))");
    expect(fuente).toContain("background-clip: text");
  });
});
