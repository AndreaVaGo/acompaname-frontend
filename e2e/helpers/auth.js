// Funciones que comparten los tests e2e para registrarse e iniciar sesión

// Cada ejecución usa emails distintos para no chocar con usuarios ya creados
const sufijo = Date.now();

export const PASSWORD = "Password123";

export function datosUsuario(nombre, rol) {
  const id = nombre.split(" ")[0].toLowerCase();
  return {
    nombre,
    email: `e2e.${id}.${rol}.${sufijo}@test.com`,
    telefono: "600123456",
    password: PASSWORD,
    rol,
  };
}

export async function rellenarRegistro(page, usuario) {
  const rolesCargados = page.waitForResponse((r) => r.url().includes("/roles"));
  await page.goto("/registro");
  await rolesCargados;

  await page.fill("#nombre", usuario.nombre);
  await page.fill("#email", usuario.email);
  await page.fill("#password", usuario.password);
  await page.fill("#telefono", usuario.telefono);
  await page
    .locator(".register__role", {
      hasText: usuario.rol === "cuidador" ? "Cuidador" : "Familia",
    })
    .click();
}

export async function registrar(page, usuario) {
  await rellenarRegistro(page, usuario);
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await page.waitForURL(/\/login$/);
}

export async function iniciarSesion(page, email, password) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Entrar" }).click();
}