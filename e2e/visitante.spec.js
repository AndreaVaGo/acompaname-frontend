import { test, expect } from "@playwright/test";

test.describe("Visitante sin sesión", () => {
  test("puede ver los cuidadores desde la portada", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Ver personas cuidadoras disponibles" }).click();

    await expect(page).toHaveURL("/buscar");
    await expect(page.getByText("Personas cuidadoras disponibles")).toBeVisible();
    await expect(
      page.getByText("No se pudieron cargar las personas cuidadoras."),
    ).toHaveCount(0);
    await page.screenshot({ path: "docs/screenshots/e2e-08-visitante-buscar.png" });
  });

  test("la portada muestra la animación y se puede pausar", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("img", { name: /Animación de 15 segundos/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Pausar animación" }).click();

    await expect(
      page.getByRole("button", { name: "Reproducir animación" }),
    ).toBeVisible();
  });

  test("las tarjetas de la portada aparecen al llegar a ellas", async ({ page }) => {
    await page.goto("/");

    const tarjetas = page.locator(".landing__step-card");
    await tarjetas.first().scrollIntoViewIfNeeded();

    // Empiezan invisibles y, al verse, terminan con opacidad completa
    for (let i = 0; i < 3; i++) {
      await expect(tarjetas.nth(i)).toHaveCSS("opacity", "1");
    }
  });

  test("si entra en sus solicitudes lo mandan al login", async ({ page }) => {
    await page.goto("/solicitudes");

    await expect(page).toHaveURL("/login");
  });

  test("desde el pie de página se llega a los términos y condiciones", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Términos y condiciones" }).click();

    await expect(page).toHaveURL("/terminos");
    await expect(
      page.getByRole("heading", { name: "Términos y condiciones de uso" }),
    ).toBeVisible();
  });

  test("cada página tiene su título en la pestaña", async ({ page }) => {
    await page.goto("/privacidad");

    await expect(page).toHaveTitle("Política de privacidad · Acompáñame");
  });

  test("robots.txt y sitemap.xml se pueden consultar", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/terminos");
  });

  test("una dirección que no existe muestra la página 404 y se puede volver", async ({
    page,
  }) => {
    await page.goto("/esta-pagina-no-existe");

    await expect(
      page.getByRole("heading", { name: "No encontramos esta página" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Volver al inicio" }).click();

    await expect(page).toHaveURL("/");
  });

  test("si entra en un pago lo mandan al login", async ({ page }) => {
    await page.goto("/pagar/1");

    await expect(page).toHaveURL("/login");
  });
});