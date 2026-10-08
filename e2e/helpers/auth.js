// Funciones que comparten los tests e2e para registrarse y entrar

// Número distinto en cada ejecución, para que los emails no se repitan
const numero = Date.now();

export const PASSWORD = "Password123";

export function datosUsuario(nombre, rol) {
  const nombreSinEspacios = nombre.toLowerCase().replaceAll(" ", ".");
  return {
    nombre: nombre,
    email: nombreSinEspacios + "." + numero + "@test.com",
    telefono: "600123456",
    password: PASSWORD,
    rol: rol,
  };
}

// Rellena el formulario de registro y pulsa "Crear mi cuenta"
export async function rellenarRegistro(page, usuario) {
  await page.goto("/registro");
  // Esperamos a que la página termine de cargar los roles
  await page.waitForLoadState("networkidle");

  await page.fill("#nombre", usuario.nombre);
  await page.fill("#email", usuario.email);
  await page.fill("#password", usuario.password);
  await page.fill("#telefono", usuario.telefono);

  if (usuario.rol === "cuidador") {
    await page.getByRole("button", { name: "Cuidador" }).click();
  } else {
    await page.getByRole("button", { name: "Familia" }).click();
  }

  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
}

// Registra al usuario y espera a llegar a la pantalla de login
export async function registrar(page, usuario) {
  await rellenarRegistro(page, usuario);
  await page.waitForURL("/login");
}

export async function iniciarSesion(page, email, password) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Entrar" }).click();
}