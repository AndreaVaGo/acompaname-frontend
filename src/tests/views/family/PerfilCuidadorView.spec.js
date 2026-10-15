import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import PerfilCuidadorView from "../../../views/family/PerfilCuidadorView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";
import { useAuthStore } from "../../../stores/auth";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/cuidador/:id", name: "perfil-cuidador", component: PerfilCuidadorView },
    ],
  });
}

async function montarVista(rol) {
  const router = crearRouter();
  await router.push("/cuidador/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(PerfilCuidadorView, {
    global: {
      plugins: [router, pinia],
    },
  });

  const authStore = useAuthStore(pinia);
  if (rol) {
    authStore.login(1, "ana@test.com", "12345678", rol);
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  return wrapper;
}

// Cuidador con valoraciones, para los tests de la lista
function cuidadorConValoraciones() {
  return {
    usuarioNombre: "Pepe",
    especialidad: "Geriatría",
    anosExperiencia: 4,
    tarifaHora: 18,
    disponibleAhora: true,
    bio: "Cuidador con experiencia",
    valoracionMedia: 4.5,
    numValoraciones: 2,
  };
}

// Pulsa el enlace de valoraciones y espera a que se pinte la lista
async function abrirLista(wrapper) {
  await wrapper.find(".perfil__valoracion-boton").trigger("click");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("PerfilCuidadorView", () => {
  // Cada test empieza sin sesión iniciada
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("muestra los datos del cuidador", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Geriatría");
  });

  test("muestra la foto del cuidador si la tiene", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
      foto: "https://ejemplo.com/pepe.jpg",
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find("img").attributes("src")).toBe(
      "https://ejemplo.com/pepe.jpg"
    );
  });

  test("muestra el monigote si el cuidador no tiene foto", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".foto-cuidador--sin-foto").exists()).toBe(true);
  });

  test("muestra un mensaje de error si falla la carga", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.text()).toContain(
      "No se pudo cargar el perfil del cuidador."
    );
  });

  test("muestra el botón de solicitar si el usuario es FAMILIA", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".perfil__solicitar").exists()).toBe(true);
  });

  test("no muestra el botón de solicitar si el usuario es CUIDADOR", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista("CUIDADOR");

    expect(wrapper.find(".perfil__solicitar").exists()).toBe(false);
  });

  test("un visitante sin sesión ve el enlace para iniciar sesión", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista(null);

    expect(wrapper.text()).toContain("Inicia sesión para solicitar");
    expect(wrapper.text()).not.toContain("Solicitar servicio");
  });

  test("muestra la valoración media y el número de valoraciones", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
      valoracionMedia: 4.7,
      numValoraciones: 3,
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".perfil__valoracion").text()).toContain("4.7");
    expect(wrapper.find(".perfil__valoracion").text()).toContain(
      "3 valoraciones"
    );
  });

  test("con una sola valoración usa el singular", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
      valoracionMedia: 5,
      numValoraciones: 1,
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".perfil__valoracion").text()).toContain(
      "1 valoración)"
    );
  });

  test("avisa si el cuidador todavía no tiene valoraciones", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
      valoracionMedia: null,
      numValoraciones: 0,
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".perfil__valoracion").text()).toContain(
      "Sin valoraciones todavía"
    );
  });

  test("muestra los servicios del cuidador con su nombre", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
      servicios: ["medicacion", "nocturno"],
    });

    const wrapper = await montarVista("FAMILIA");

    const servicios = wrapper.findAll(".perfil__servicio");
    expect(servicios.length).toBe(2);
    expect(servicios[0].text()).toBe("Medicación");
    expect(servicios[1].text()).toBe("Acompañamiento nocturno");
  });

  test("no muestra la sección de servicios si el cuidador no tiene", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
      servicios: [],
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".perfil__servicios").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Servicios");
  });

  test("no muestra el sexo del cuidador en el perfil público", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepa",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidadora con experiencia",
      sexo: "MUJER",
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.text()).toContain("Pepa");
    expect(wrapper.text()).not.toContain("Sexo");
  });

  test("el enlace a las valoraciones solo aparece si el cuidador tiene", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
      valoracionMedia: null,
      numValoraciones: 0,
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".perfil__valoracion-boton").exists()).toBe(false);
  });

  test("las valoraciones no se piden hasta pulsar el enlace", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    const espia = vi
      .spyOn(ValoracionRepository.prototype, "getPorCuidador")
      .mockResolvedValue([]);

    const wrapper = await montarVista("FAMILIA");

    expect(espia).not.toHaveBeenCalled();
    expect(wrapper.find(".perfil__modal").exists()).toBe(false);
  });

  test("al pulsar el enlace pide las valoraciones del cuidador y abre la lista", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    const espia = vi
      .spyOn(ValoracionRepository.prototype, "getPorCuidador")
      .mockResolvedValue([]);

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);

    expect(espia).toHaveBeenCalledWith("3");
    expect(wrapper.find(".perfil__modal").exists()).toBe(true);
    expect(wrapper.find(".perfil__modal").text()).toContain(
      "Valoraciones de Pepe"
    );
  });

  test("la lista muestra estrellas, fecha y comentario de cada valoración", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    vi.spyOn(ValoracionRepository.prototype, "getPorCuidador").mockResolvedValue([
      { puntuacion: 5, comentario: "Muy atento con mi madre", fecha: "2026-10-12" },
      { puntuacion: 4, comentario: "Puntual y amable", fecha: "2026-10-01" },
    ]);

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);

    const resenas = wrapper.findAll(".perfil__resena");
    expect(resenas.length).toBe(2);
    expect(resenas[0].text()).toContain("Muy atento con mi madre");
    expect(resenas[0].text()).toContain("12-10-2026");
    expect(resenas[0].find(".perfil__resena-estrellas").text()).toBe(
      "⭐⭐⭐⭐⭐"
    );
    expect(resenas[1].text()).toContain("Puntual y amable");
    expect(resenas[1].text()).toContain("01-10-2026");
    expect(resenas[1].find(".perfil__resena-estrellas").text()).toBe("⭐⭐⭐⭐");
  });

  test("si la lista llega vacía avisa de que no hay valoraciones", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    vi.spyOn(ValoracionRepository.prototype, "getPorCuidador").mockResolvedValue(
      []
    );

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);

    expect(wrapper.find(".perfil__modal").text()).toContain(
      "Todavía no hay valoraciones."
    );
    expect(wrapper.find(".perfil__resena").exists()).toBe(false);
  });

  test("si falla la carga de las valoraciones muestra un error", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    vi.spyOn(ValoracionRepository.prototype, "getPorCuidador").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);

    expect(wrapper.find(".perfil__error").text()).toBe(
      "No se pudieron cargar las valoraciones."
    );
  });

  test("la lista se cierra con la cruz", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    vi.spyOn(ValoracionRepository.prototype, "getPorCuidador").mockResolvedValue(
      []
    );

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);
    await wrapper.find(".perfil__cerrar").trigger("click");

    expect(wrapper.find(".perfil__modal").exists()).toBe(false);
  });

  test("la lista se cierra con el botón Cerrar", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    vi.spyOn(ValoracionRepository.prototype, "getPorCuidador").mockResolvedValue(
      []
    );

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);
    await wrapper.find(".perfil__modal .btn--secondary").trigger("click");

    expect(wrapper.find(".perfil__modal").exists()).toBe(false);
  });

  test("la lista se cierra al pulsar fuera de la ventana", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    vi.spyOn(ValoracionRepository.prototype, "getPorCuidador").mockResolvedValue(
      []
    );

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);
    await wrapper.find(".perfil__fondo").trigger("click");

    expect(wrapper.find(".perfil__modal").exists()).toBe(false);
  });

  test("pulsar dentro de la ventana no la cierra", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(
      cuidadorConValoraciones()
    );
    vi.spyOn(ValoracionRepository.prototype, "getPorCuidador").mockResolvedValue(
      []
    );

    const wrapper = await montarVista("FAMILIA");
    await abrirLista(wrapper);
    await wrapper.find(".perfil__modal").trigger("click");

    expect(wrapper.find(".perfil__modal").exists()).toBe(true);
  });
});