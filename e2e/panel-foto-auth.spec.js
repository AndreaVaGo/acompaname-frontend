import { test, expect } from "@playwright/test";

// ACOM-189: el panel con foto del login y del registro se ve en escritorio y se esconde en el móvil
const PAGINAS = [
  { nombre: "login", ruta: "/login", campo: "#email" },
  { nombre: "registro", ruta: "/registro", campo: "#nombre" },
];

for (const pagina of PAGINAS) {
  test.describe(`Panel con foto en ${pagina.nombre}`, () => {
    test("en escritorio se ve la foto, cargada, con el lema", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(pagina.ruta);
      await page.waitForLoadState("networkidle");

      const panel = page.getByTestId("panel-foto");
      await expect(panel).toBeVisible();
      await expect(panel.getByText("Cuidar también es acompañar")).toBeVisible();
      const cargada = await panel.locator("img").evaluate((imagen) => imagen.complete && imagen.naturalWidth > 0);
      expect(cargada).toBe(true);
      await page.screenshot({ path: `docs/screenshots/e2e-panel-foto-${pagina.nombre}-escritorio.png` });
    });

    test("en el móvil no se ve la foto y el formulario se puede usar", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await page.goto(pagina.ruta);
      await page.waitForLoadState("networkidle");

      await expect(page.getByTestId("panel-foto")).toBeHidden();
      await expect(page.locator(pagina.campo)).toBeVisible();
      await page.screenshot({ path: `docs/screenshots/e2e-panel-foto-${pagina.nombre}-movil.png` });
    });

    test("el formulario no se sale de la pantalla en ningún tamaño", async ({ page }) => {
      for (const ancho of [390, 800, 1280]) {
        await page.setViewportSize({ width: ancho, height: 800 });
        await page.goto(pagina.ruta);
        await page.waitForLoadState("networkidle");

        const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(sobra).toBeLessThanOrEqual(0);
      }
    });
  });
}
