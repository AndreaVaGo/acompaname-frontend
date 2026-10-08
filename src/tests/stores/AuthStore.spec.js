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
    expect(store.credenciales).toBe("");
  });

  test("login guarda los datos del usuario en el store", () => {
    const store = useAuthStore();

    store.login(5, "ana@test.com", "12345678", "FAMILIA");

    expect(store.estaAutenticado).toBe(true);
    expect(store.id).toBe(5);
    expect(store.email).toBe("ana@test.com");
    expect(store.rol).toBe("FAMILIA");
  });

  test("login genera las credenciales Basic en base64", () => {
    const store = useAuthStore();

    store.login(5, "ana@test.com", "12345678", "FAMILIA");

    expect(store.credenciales).toBe(btoa("ana@test.com:12345678"));
  });

  test("login guarda la sesión en sessionStorage", () => {
    const store = useAuthStore();

    store.login(5, "ana@test.com", "12345678", "FAMILIA");

    expect(sessionStorage.getItem("email")).toBe("ana@test.com");
    expect(sessionStorage.getItem("rol")).toBe("FAMILIA");
    expect(sessionStorage.getItem("credenciales")).toBe(
      btoa("ana@test.com:12345678")
    );
  });

  test("logout borra el store y el sessionStorage", () => {
    const store = useAuthStore();
    store.login(5, "ana@test.com", "12345678", "FAMILIA");

    store.logout();

    expect(store.estaAutenticado).toBe(false);
    expect(store.email).toBe("");
    expect(store.credenciales).toBe("");
    expect(sessionStorage.getItem("email")).toBeNull();
    expect(sessionStorage.getItem("credenciales")).toBeNull();
  });

  test("recupera la sesión desde sessionStorage al recargar la página", () => {
    sessionStorage.setItem("id", "8");
    sessionStorage.setItem("email", "pepe@test.com");
    sessionStorage.setItem("rol", "CUIDADOR");
    sessionStorage.setItem("credenciales", btoa("pepe@test.com:12345678"));

    const store = useAuthStore();

    expect(store.estaAutenticado).toBe(true);
    expect(store.email).toBe("pepe@test.com");
    expect(store.rol).toBe("CUIDADOR");
  });
});