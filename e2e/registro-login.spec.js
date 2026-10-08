import { test, expect } from "@playwright/test";
import {
  datosUsuario,
  rellenarRegistro,
  registrar,
  iniciarSesion,
} from "./helpers/auth.js";

test.describe("Registro y login", () => {
  test("una familia se registra y llega al login", async ({ page }) => {
    const familia = datosUsuario("Ana E2E", "familia");

    await rellenarRegistro(page, familia);

    await expect(page).toHaveURL("/login");
  });

  test("una familia registrada inicia sesión y ve su menú", async ({ page }) => {
    const familia = datosUsuario("Luis E2E", "familia");
    await registrar(page, familia);

    await iniciarSesion(page, familia.email, familia.password);

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Buscar" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Solicitudes" })).toBeVisible();
    await page.screenshot({ path: "docs/screenshots/e2e-01-login.png" });
  });

  test("con una contraseña incorrecta muestra el error", async ({ page }) => {
    const familia = datosUsuario("Marta E2E", "familia");
    await registrar(page, familia);

    await iniciarSesion(page, familia.email, "ContraseñaMala1");

    await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
    await expect(page).toHaveURL("/login");
    await page.screenshot({ path: "docs/screenshots/e2e-02-login-error.png" });
  });

  test("no deja registrar dos veces el mismo email", async ({ page }) => {
    const familia = datosUsuario("Pablo E2E", "familia");
    await registrar(page, familia);

    await rellenarRegistro(page, familia);

    await expect(
      page.getByText("No se pudo completar el registro. Revisa los datos."),
    ).toBeVisible();
    await expect(page).toHaveURL("/registro");
  });

  test("cerrar sesión lleva al login", async ({ page }) => {
    const familia = datosUsuario("Sara E2E", "familia");
    await registrar(page, familia);
    await iniciarSesion(page, familia.email, familia.password);
    await expect(page.getByRole("link", { name: "Buscar" })).toBeVisible();

    await page.getByRole("button", { name: "Abrir menú de mi cuenta" }).click();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();

    await expect(page).toHaveURL("/login");
  });
});