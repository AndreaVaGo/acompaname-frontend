import { test, expect } from "@playwright/test";
import { datosUsuario, registrar, iniciarSesion } from "./helpers/auth.js";

// Cierra la sesión desde el menú de la cuenta
async function cerrarSesion(page) {
  await page.getByRole("button", { name: "Abrir menú de mi cuenta" }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
}

test("la familia solicita, el cuidador acepta y la familia paga", async ({
  page,
}) => {
  // Datos de los dos usuarios (el nombre del cuidador es único en cada ejecución)
  const nombreCuidador = "Pepe " + Date.now();
  const cuidador = datosUsuario(nombreCuidador, "cuidador");
  const familia = datosUsuario("Ana Flujo", "familia");

  // 1. El cuidador se registra, entra y rellena su perfil
  await registrar(page, cuidador);
  await iniciarSesion(page, cuidador.email, cuidador.password);
  await page.getByRole("button", { name: "Abrir menú de mi cuenta" }).click();
  await page.getByRole("button", { name: "Editar mi perfil" }).click();
  await page.fill("#especialidad", "Geriatría");
  await page.fill("#anos", "4");
  await page.fill("#tarifa", "18");
  await page.fill("#bio", "Cuido a personas mayores en casa y en el hospital.");
  await page.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(page.getByText("Perfil guardado correctamente.")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/e2e-04-perfil-cuidador.png" });
  await cerrarSesion(page);

  // 2. La familia se registra, entra y busca al cuidador
  await registrar(page, familia);
  await iniciarSesion(page, familia.email, familia.password);
  await page.getByRole("link", { name: "Buscar" }).click();
  await page
    .getByPlaceholder("Buscar por nombre o especialidad...")
    .fill(nombreCuidador);
  await expect(page.getByText("18 €/hora")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/e2e-05-buscar.png" });

  // 3. La familia entra en su perfil y le envía una solicitud
  await page.getByRole("link", { name: "Ver perfil" }).click();
  await page.getByRole("link", { name: "Solicitar servicio" }).click();
  await page.getByRole("button", { name: "Hospitalario" }).click();
  await page.fill("#fecha", "2030-01-15");
  await page.fill("#paciente", "Antonio Serrano");
  await page.fill("#edad", "81");
  await page.fill("#notas", "Alergia a la penicilina");
  await page.getByRole("button", { name: "Enviar solicitud" }).click();

  // La pantalla de confirmación enseña los datos reales de la solicitud
  await expect(page.getByText("Solicitud enviada")).toBeVisible();
  await expect(page.getByText("Antonio Serrano, 81 años")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/e2e-06-confirmacion.png" });

  // La solicitud aparece como pendiente
  await page.getByRole("link", { name: "Ver mis solicitudes" }).click();
  await expect(page.getByText("Pendiente")).toBeVisible();
  await cerrarSesion(page);

  // 4. El cuidador entra y acepta la solicitud
  await iniciarSesion(page, cuidador.email, cuidador.password);
  await page.getByRole("link", { name: "Solicitudes" }).click();
  await page.getByRole("button", { name: "Aceptar" }).click();
  await expect(page.getByText("Aceptada")).toBeVisible();
  await cerrarSesion(page);

  // 5. La familia entra y paga (el pago se creó solo al aceptar)
  await iniciarSesion(page, familia.email, familia.password);
  await page.getByRole("link", { name: "Solicitudes" }).click();
  await page.getByRole("link", { name: "Pagar" }).click();
  await expect(page.getByText("Importe: 18")).toBeVisible();
  await page.fill("#numero", "4242424242424242");
  await page.fill("#nombre", "Ana Flujo");
  await page.fill("#caducidad", "12/30");
  await page.fill("#cvv", "123");
  await page.screenshot({ path: "docs/screenshots/e2e-07-checkout.png" });
  await page.getByRole("button", { name: "Pagar" }).click();

  // 6. Al volver a pagar, ya figura como pagado
  await page.getByRole("link", { name: "Pagar" }).click();
  await expect(page.getByText("Este servicio ya está pagado.")).toBeVisible();
});