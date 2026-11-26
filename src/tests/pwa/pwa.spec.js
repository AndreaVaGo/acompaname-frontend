import { describe, test, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

// ACOM-174: la web se puede instalar en el móvil (manifiesto, iconos y service worker)
// Las rutas son desde la carpeta del proyecto, como en los otros tests que leen archivos
function leer(ruta) {
  return readFileSync(ruta, "utf-8");
}

describe("PWA", () => {
  const manifiesto = JSON.parse(leer("public/manifest.webmanifest"));

  test("el manifiesto tiene nombre, inicio y modo de app", () => {
    expect(manifiesto.name).toBe("Acompáñame");
    expect(manifiesto.start_url).toBe("/");
    expect(manifiesto.display).toBe("standalone");
    expect(manifiesto.lang).toBe("es");
  });

  test("el manifiesto usa los colores de la paleta", () => {
    expect(manifiesto.theme_color).toBe("#eaf6ef");
    expect(manifiesto.background_color).toBe("#eaf6ef");
  });

  test("todos los iconos del manifiesto existen", () => {
    for (const icono of manifiesto.icons) {
      expect(existsSync("public" + icono.src)).toBe(true);
    }
  });

  test("hay iconos de 192 y de 512 y uno maskable", () => {
    const tamanos = manifiesto.icons.map((i) => i.sizes);
    expect(tamanos).toContain("192x192");
    expect(tamanos).toContain("512x512");
    const propositos = manifiesto.icons.map((i) => i.purpose);
    expect(propositos).toContain("maskable");
  });

  test("index.html enlaza el manifiesto y el icono de iPhone", () => {
    const html = leer("index.html");
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(existsSync("public/icons/apple-touch-icon.png")).toBe(true);
  });

  test("el service worker existe y no guarda nada en caché", () => {
    const sw = leer("public/sw.js");
    expect(sw).toContain('addEventListener("fetch"');
    expect(sw).not.toContain("caches.");
  });

  test("main.js registra el service worker solo en la web publicada", () => {
    const main = leer("src/main.js");
    expect(main).toContain("serviceWorker.register");
    expect(main).toContain("import.meta.env.PROD");
  });
});
