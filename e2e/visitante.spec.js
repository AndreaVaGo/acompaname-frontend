import { test, expect } from "@playwright/test";

test.describe("Visitante sin sesión", () => {
  test("puede ver los cuidadores desde la portada", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Ver cuidadores disponibles" }).click();

    await expect(page).toHaveURL("/buscar");
    await expect(page.getByText("Cuidadores disponibles")).toBeVisible();
    await expect(
      page.getByText("No se pudieron cargar los cuidadores."),
    ).toHaveCount(0);
    await page.screenshot({ path: "docs/screenshots/e2e-08-visitante-buscar.png" });
  });

  test("si entra en sus solicitudes lo mandan al login", async ({ page }) => {
    await page.goto("/solicitudes");

    await expect(page).toHaveURL("/login");
  });

  test("si entra en un pago lo mandan al login", async ({ page }) => {
    await page.goto("/pagar/1");

    await expect(page).toHaveURL("/login");
  });
});