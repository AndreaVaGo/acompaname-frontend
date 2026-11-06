import { describe, test, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../../stores/auth";

describe("auth store", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setActivePinia(createPinia());
  });

  test("empieza sin sesión iniciada", () => {
    const store = useAuthStore();

    expect(store.estaAutenticado).toBe(false);
    expect(store.email).toBe("");
    expect(store.rol).toBe("");
    expect(store.token).toBe("");
  });

  test("login guarda los datos del usuario en el store", () => {
    const store = useAuthStore();

    store.login(5, "ana@test.com", "token-de-prueba", "FAMILIA");

    expect(store.estaAutenticado).toBe(true);
    expect(store.id).toBe(5);
    expect(store.email).toBe("ana@test.com");
    expect(store.rol).toBe("FAMILIA");
  });

  test("login guarda el token que da el servidor", () => {
    const store = useAuthStore();

    store.login(5, "ana@test.com", "token-de-prueba", "FAMILIA");

    expect(store.token).toBe("token-de-prueba");
  });

  test("login guarda la sesión en sessionStorage", () => {
    const store = useAuthStore();

    store.login(5, "ana@test.com", "token-de-prueba", "FAMILIA");

    expect(sessionStorage.getItem("email")).toBe("ana@test.com");
    expect(sessionStorage.getItem("rol")).toBe("FAMILIA");
    expect(sessionStorage.getItem("token")).toBe("token-de-prueba");
  });

  test("actualizarEmail cambia el email en el store y en sessionStorage", () => {
    const store = useAuthStore();
    store.login(5, "ana@test.com", "token-de-prueba", "FAMILIA");

    store.actualizarEmail("nueva@test.com");

    expect(store.email).toBe("nueva@test.com");
    expect(sessionStorage.getItem("email")).toBe("nueva@test.com");
  });

  test("actualizarEmail mantiene el token: la sesión sigue valiendo", () => {
    const store = useAuthStore();
    store.login(5, "ana@test.com", "token-de-prueba", "FAMILIA");

    store.actualizarEmail("nueva@test.com");

    expect(store.token).toBe("token-de-prueba");
    expect(sessionStorage.getItem("token")).toBe("token-de-prueba");
    expect(store.estaAutenticado).toBe(true);
  });

  test("logout borra el store y el sessionStorage", () => {
    const store = useAuthStore();
    store.login(5, "ana@test.com", "token-de-prueba", "FAMILIA");

    store.logout();

    expect(store.estaAutenticado).toBe(false);
    expect(store.email).toBe("");
    expect(store.token).toBe("");
    expect(sessionStorage.getItem("email")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  test("setFoto guarda la foto en el store", () => {
    const store = useAuthStore();

    store.setFoto("data:image/jpeg;base64,AAAA");

    expect(store.foto).toBe("data:image/jpeg;base64,AAAA");
  });

  test("logout borra la foto", () => {
    const store = useAuthStore();
    store.login(5, "ana@test.com", "token-de-prueba", "CUIDADOR");
    store.setFoto("data:image/jpeg;base64,AAAA");

    store.logout();

    expect(store.foto).toBe("");
  });

  test("recupera la sesión desde sessionStorage al recargar la página", () => {
    sessionStorage.setItem("id", "8");
    sessionStorage.setItem("email", "pepe@test.com");
    sessionStorage.setItem("rol", "CUIDADOR");
    sessionStorage.setItem("token", "token-de-prueba");

    const store = useAuthStore();

    expect(store.estaAutenticado).toBe(true);
    expect(store.email).toBe("pepe@test.com");
    expect(store.rol).toBe("CUIDADOR");
    expect(store.token).toBe("token-de-prueba");
  });

  // Una sesión guardada con el sistema antiguo (credenciales Basic) ya no vale: hay que volver a entrar
  test("una sesión antigua con credenciales y sin token no cuenta como iniciada", () => {
    sessionStorage.setItem("email", "pepe@test.com");
    sessionStorage.setItem("credenciales", "cGVwZUB0ZXN0LmNvbToxMjM0NTY3OA==");

    const store = useAuthStore();

    expect(store.estaAutenticado).toBe(false);
  });
});