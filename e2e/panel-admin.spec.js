import { test, expect } from "@playwright/test";
import { iniciarSesion } from "./helpers/auth.js";

// Cuenta del administrador de pruebas (la que crea el back con ADMIN_EMAIL y ADMIN_PASSWORD).
// Se puede cambiar con variables de entorno sin tocar el código.
const EMAIL_ADMIN = process.env.ADMIN_E2E_EMAIL || "admin.prueba@acompaname.com";
const PASSWORD_ADMIN = process.env.ADMIN_E2E_PASSWORD || "Prueba1234";

// Botón del menú lateral del panel
function botonMenu(page, texto) {
  return page
    .getByRole("navigation", { name: "Secciones del panel" })
    .getByRole("button", { name: texto, exact: true });
}

// Bloque que siempre sale en el Resumen (el de avisos solo sale si hay avisos)
function bloqueResumen(page) {
  return page.getByText("Solicitudes por estado");
}

test.describe("Panel de administración", () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page, EMAIL_ADMIN, PASSWORD_ADMIN);
    // El administrador entra directamente en su panel
    await expect(page).toHaveURL("/admin");
  });

  test("el administrador entra en el Resumen con el menú lateral", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Panel de administración" }),
    ).toBeVisible();
    await expect(botonMenu(page, "Resumen")).toHaveAttribute("aria-current", "page");
    await expect(botonMenu(page, "Solicitudes")).toBeVisible();
    await expect(botonMenu(page, "Pagos")).toBeVisible();
    await expect(botonMenu(page, "Usuarios")).toBeVisible();
    await expect(bloqueResumen(page)).toBeVisible();
    await expect(page.getByText("Cuidadores mejor valorados")).toBeVisible();
    await page.screenshot({ path: "docs/screenshots/e2e-08-admin-resumen.png" });
  });

  test("la sección Usuarios muestra la tabla y oculta el resumen", async ({ page }) => {
    await botonMenu(page, "Usuarios").click();

    await expect(botonMenu(page, "Usuarios")).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "Usuarios", exact: true })).toBeVisible();
    await expect(page.locator(".admin-usuarios")).toContainText(EMAIL_ADMIN);
    await expect(bloqueResumen(page)).toHaveCount(0);
    await page.screenshot({ path: "docs/screenshots/e2e-09-admin-usuarios.png" });
  });

  test("la sección Solicitudes tiene el filtro por estado", async ({ page }) => {
    await botonMenu(page, "Solicitudes").click();

    await expect(botonMenu(page, "Solicitudes")).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "Solicitudes", exact: true })).toBeVisible();
    await page.locator(".admin-solicitudes select").selectOption("PENDIENTE");
    await expect(page.locator(".admin-solicitudes select")).toHaveValue("PENDIENTE");
    await expect(bloqueResumen(page)).toHaveCount(0);
    await page.screenshot({ path: "docs/screenshots/e2e-10-admin-solicitudes.png" });
  });

  test("la sección Pagos muestra las tarjetas, los gráficos y el detalle", async ({ page }) => {
    await botonMenu(page, "Pagos").click();

    await expect(botonMenu(page, "Pagos")).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("Total cobrado")).toBeVisible();
    await expect(page.getByText("Pendiente de cobro")).toBeVisible();
    await expect(page.getByText("Porcentaje cobrado")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pagos por mes" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Facturado por tipo de cuidado" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Cuidadores que más han cobrado" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Detalle de pagos" })).toBeVisible();
    await expect(bloqueResumen(page)).toHaveCount(0);
    await page.screenshot({ path: "docs/screenshots/e2e-11-admin-pagos.png", fullPage: true });
  });

  test("la tabla de pagos se puede filtrar por estado y buscar", async ({ page }) => {
    await botonMenu(page, "Pagos").click();

    await page.locator(".admin-pagos-tabla select").selectOption("CANCELADO");
    await expect(page.locator(".admin-pagos-tabla select")).toHaveValue("CANCELADO");

    // Con un texto que no existe, la tabla avisa (según haya pagos o no en ese estado)
    await page.locator(".admin-pagos-tabla input[type='search']").fill("zzzzzz");
    await expect(
      page.getByText(/No hay pagos con este estado|Ningún pago coincide con la búsqueda/),
    ).toBeVisible();
  });

  test("se puede volver al Resumen desde otra sección", async ({ page }) => {
    await botonMenu(page, "Usuarios").click();
    await botonMenu(page, "Resumen").click();

    await expect(botonMenu(page, "Resumen")).toHaveAttribute("aria-current", "page");
    await expect(bloqueResumen(page)).toBeVisible();
    await expect(page.locator(".admin-usuarios")).toHaveCount(0);
  });
});