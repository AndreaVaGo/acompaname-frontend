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
    // El nombre completo se ve dentro del botón del perfil
    await expect(page.locator(".navbar__nombre")).toContainText("Luis E2E");
    await page.screenshot({ path: "docs/screenshots/e2e-01-login.png" });
  });

  test("con una contraseña incorrecta muestra el error", async ({ page }) => {
    const familia = datosUsuario("Marta E2E", "familia");
    await registrar(page, familia);

    await iniciarSesion(page, familia.email, "ContraseñaMala1");

    // El mensaje también avisa de que la cuenta puede estar bloqueada
    await expect(page.getByText("Email o contraseña incorrectos")).toBeVisible();
    await expect(page).toHaveURL("/login");
    await page.screenshot({ path: "docs/screenshots/e2e-02-login-error.png" });
  });

  test("no deja registrar dos veces el mismo email", async ({ page }) => {
    const familia = datosUsuario("Pablo E2E", "familia");
    await registrar(page, familia);

    await rellenarRegistro(page, familia);

    // Después de la frase fija, la pantalla añade el motivo que da el servidor
    await expect(
      page.getByText("No se pudo completar el registro."),
    ).toBeVisible();
    await expect(page).toHaveURL("/registro");
  });

  test("no deja registrarse con una contraseña débil y dice qué le falta", async ({
    page,
  }) => {
    const familia = datosUsuario("Elena E2E", "familia");
    // Solo minúsculas: faltan mayúscula, número y carácter especial
    familia.password = "abcdefgh";

    await rellenarRegistro(page, familia);

    await expect(page.getByText("una letra mayúscula")).toBeVisible();
    await expect(page).toHaveURL("/registro");
  });

  test("no deja registrarse si las dos contraseñas no coinciden", async ({
    page,
  }) => {
    const familia = datosUsuario("Julia E2E", "familia");
    familia.passwordRepetida = "Distinta123!";

    await rellenarRegistro(page, familia);

    await expect(page.getByText("Las contraseñas no coinciden.")).toBeVisible();
    await expect(page).toHaveURL("/registro");
  });

  test("cerrar sesión lleva a la portada y quita el menú de la cuenta", async ({ page }) => {
    const familia = datosUsuario("Sara E2E", "familia");
    await registrar(page, familia);
    await iniciarSesion(page, familia.email, familia.password);
    // Se espera a llegar a la portada antes de cerrar sesión: si no, el login
    // todavía está redirigiendo y esa redirección pisa la del cierre de sesión
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Buscar" })).toBeVisible();

    await page.getByRole("button", { name: "Abrir menú de mi cuenta" }).click();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();

    // Al cerrar la sesión se vuelve a la portada, con los enlaces de visitante
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Iniciar sesión" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Buscar" })).toHaveCount(0);
  });

  test("el ojo enseña y oculta la contraseña en el login y en el registro", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#password", "Secreta123!");
    await expect(page.locator("#password")).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Mostrar contraseña" }).click();
    await expect(page.locator("#password")).toHaveAttribute("type", "text");
    await expect(page.locator("#password")).toHaveValue("Secreta123!");

    await page.getByRole("button", { name: "Ocultar contraseña" }).click();
    await expect(page.locator("#password")).toHaveAttribute("type", "password");

    // En el registro hay dos campos, cada uno con su ojo
    await page.goto("/registro");
    const ojos = page.getByRole("button", { name: "Mostrar contraseña" });
    await expect(ojos).toHaveCount(2);
    await ojos.first().click();
    await expect(page.locator("#password")).toHaveAttribute("type", "text");
    await expect(page.locator("#password-repetida")).toHaveAttribute(
      "type",
      "password",
    );
    await page.screenshot({ path: "docs/screenshots/e2e-03-ojo-password.png" });
  });
});