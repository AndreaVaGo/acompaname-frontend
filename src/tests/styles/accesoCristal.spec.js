import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de cristal en las pantallas de acceso y en los formularios comunes
const pantallas = [
  { nombre: "OlvidePasswordView", ruta: "src/views/auth/OlvidePasswordView.vue", clase: "olvide", fondo: true },
  { nombre: "RestablecerPasswordView", ruta: "src/views/auth/RestablecerPasswordView.vue", clase: "restablecer", fondo: true },
  { nombre: "CambiarPasswordView", ruta: "src/views/common/CambiarPasswordView.vue", clase: "cambiar-password", fondo: true },
  { nombre: "EnviarSugerenciaView", ruta: "src/views/common/EnviarSugerenciaView.vue", clase: "sugerencia", fondo: true },
  { nombre: "EditarDatosView", ruta: "src/views/common/EditarDatosView.vue", clase: "editar-datos", fondo: true },
  { nombre: "LoginView", ruta: "src/views/auth/LoginView.vue", clase: "login", fondo: false },
  { nombre: "RegisterView", ruta: "src/views/auth/RegisterView.vue", clase: "register", fondo: false },
];

describe.each(pantallas)("$nombre · diseño de cristal", ({ ruta, clase, fondo }) => {
  const fuente = readFileSync(ruta, "utf-8");

  test("la tarjeta es de cristal", () => {
    expect(fuente).toContain(`class="${clase}__box tarjeta-cristal"`);
  });

  test("usa el fondo animado y no pone fondo propio en el contenedor", () => {
    const inicio = fuente.indexOf(`.${clase} {`);
    const bloque = fuente.slice(inicio, fuente.indexOf("}", inicio));

    if (fondo) {
      expect(fuente).toContain(`class="${clase} pantalla"`);
    }
    expect(bloque).not.toContain("background-color");
  });

  test("la tarjeta con formulario no se levanta ni brilla al pasar el ratón", () => {
    const bloque = fuente.slice(fuente.indexOf(`.${clase}__box:hover`));

    expect(bloque.slice(0, 100)).toContain("transform: none");
    expect(fuente).toContain(`.${clase}__box::after`);
  });
});

describe("PantallaConFoto · fondo", () => {
  const foto = readFileSync("src/components/PantallaConFoto.vue", "utf-8");

  test("usa el fondo animado en vez de un color liso, para que se vea en escritorio", () => {
    expect(foto).toContain('class="pantalla-foto pantalla"');
    expect(foto).not.toContain("background-color: var(--color-bg)");
  });
});

describe("ConfirmacionView · diseño de cristal", () => {
  const fuente = readFileSync("src/views/family/ConfirmacionView.vue", "utf-8");

  test("usa el fondo animado y la tarjeta de cristal", () => {
    expect(fuente).toContain('class="confirmacion pantalla"');
    expect(fuente).toContain('class="confirmacion__box tarjeta-cristal"');
  });

  test("la tarjeta no recorta el aro del tic y no se mueve al pasar el ratón", () => {
    const bloque = fuente.slice(fuente.indexOf(".confirmacion__box {"));

    expect(bloque.slice(0, 350)).toContain("overflow: visible");
    expect(fuente).toContain(".confirmacion__box:hover");
  });
});
