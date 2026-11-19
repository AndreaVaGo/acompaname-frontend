import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { readFileSync } from "node:fs";
import BuscarView from "../../../views/family/BuscarView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";

const router = createRouter({ history: createWebHistory(), routes: [] });

function cuidador(id, nombre, ciudad) {
  return {
    id: id,
    usuarioNombre: nombre,
    especialidad: "Geriatría",
    tarifaHora: 15,
    tieneVehiculo: false,
    disponibleAhora: true,
    ciudad: ciudad,
    valoracionMedia: null,
    numValoraciones: 0,
    tipoCuidado: "ambos",
    servicios: [],
    gruposEdad: [],
    titulaciones: [],
  };
}

// Orden original: Pepe (Madrid), Ana (Gijón), Luis (Avilés), Marta (sin ciudad)
async function montarVista() {
  vi.spyOn(CuidadorRepository.prototype, "getAll").mockResolvedValue([
    cuidador(1, "Pepe", "Madrid"),
    cuidador(2, "Ana", "Gijón"),
    cuidador(3, "Luis", "Avilés"),
    cuidador(4, "Marta", ""),
  ]);
  const wrapper = mount(BuscarView, { global: { plugins: [router] } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

function nombresEnPantalla(wrapper) {
  return wrapper.findAll(".buscar__card h3").map((titulo) => titulo.text());
}

async function pedirCercania(wrapper, lugar) {
  await wrapper.find("#cerca-lugar").setValue(lugar);
  await wrapper.find("#cerca-buscar").trigger("click");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

const RESPUESTA_OVIEDO = {
  lugarEncontrado: true,
  distancias: [
    { cuidadorId: 3, km: 0.4 },
    { cuidadorId: 2, km: 25.1 },
    { cuidadorId: 1, km: 400.2 },
  ],
};

describe("BuscarView · ordenar por cercanía", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("sin pedir cercanía el orden es el de siempre y no salen distancias", async () => {
    const wrapper = await montarVista();

    expect(nombresEnPantalla(wrapper)).toEqual(["Pepe", "Ana", "Luis", "Marta"]);
    expect(wrapper.find(".buscar__card-distancia").exists()).toBe(false);
  });

  test("ordena de la persona más cerca a la más lejos y deja al final a quien no tiene distancia", async () => {
    const espia = vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue(RESPUESTA_OVIEDO);
    const wrapper = await montarVista();

    await pedirCercania(wrapper, "Oviedo");

    expect(espia).toHaveBeenCalledWith("Oviedo");
    expect(nombresEnPantalla(wrapper)).toEqual(["Luis", "Ana", "Pepe", "Marta"]);
  });

  test("enseña la distancia en la tarjeta de quien la tiene", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue(RESPUESTA_OVIEDO);
    const wrapper = await montarVista();

    await pedirCercania(wrapper, "Oviedo");

    const distancias = wrapper.findAll(".buscar__card-distancia").map((d) => d.text());
    expect(distancias).toEqual(["📏 En tu zona", "📏 A unos 25 km", "📏 A unos 400 km"]);
  });

  test("avisa de desde dónde está ordenado", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue(RESPUESTA_OVIEDO);
    const wrapper = await montarVista();

    await pedirCercania(wrapper, "  Oviedo ");

    expect(wrapper.find(".buscar__cerca-estado").text()).toContain("«Oviedo»");
  });

  test("pulsar Enter en el campo también ordena", async () => {
    const espia = vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue(RESPUESTA_OVIEDO);
    const wrapper = await montarVista();

    await wrapper.find("#cerca-lugar").setValue("Oviedo");
    await wrapper.find("#cerca-lugar").trigger("keydown.enter");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(espia).toHaveBeenCalledTimes(1);
  });

  test("con el campo vacío no pregunta al servidor y pide escribir un lugar", async () => {
    const espia = vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue(RESPUESTA_OVIEDO);
    const wrapper = await montarVista();

    await pedirCercania(wrapper, "   ");

    expect(espia).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Escribe tu ciudad o tu código postal");
  });

  test("si no encuentra el lugar lo dice y no cambia el orden", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue({ lugarEncontrado: false, distancias: [] });
    const wrapper = await montarVista();

    await pedirCercania(wrapper, "Lugarinventado");

    expect(wrapper.text()).toContain("No hemos encontrado ese lugar");
    expect(nombresEnPantalla(wrapper)).toEqual(["Pepe", "Ana", "Luis", "Marta"]);
    expect(wrapper.find(".buscar__cerca-estado").exists()).toBe(false);
  });

  test("si falla la petición muestra el error y la lista sigue igual", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getCerca").mockRejectedValue(new Error("fallo"));
    const wrapper = await montarVista();

    await pedirCercania(wrapper, "Oviedo");

    expect(wrapper.text()).toContain("No se pudo calcular la cercanía");
    expect(nombresEnPantalla(wrapper)).toEqual(["Pepe", "Ana", "Luis", "Marta"]);
  });

  test("Quitar orden devuelve la lista a su orden de siempre", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue(RESPUESTA_OVIEDO);
    const wrapper = await montarVista();
    await pedirCercania(wrapper, "Oviedo");

    await wrapper.find("#cerca-quitar").trigger("click");

    expect(nombresEnPantalla(wrapper)).toEqual(["Pepe", "Ana", "Luis", "Marta"]);
    expect(wrapper.find(".buscar__card-distancia").exists()).toBe(false);
    expect(wrapper.find(".buscar__cerca-estado").exists()).toBe(false);
  });

  test("el orden por cercanía respeta los demás filtros", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getCerca").mockResolvedValue(RESPUESTA_OVIEDO);
    const wrapper = await montarVista();
    await pedirCercania(wrapper, "Oviedo");

    // Se filtra por nombre: solo queda Ana, que sigue con su distancia
    await wrapper.find(".buscar__input").setValue("ana");

    expect(nombresEnPantalla(wrapper)).toEqual(["Ana"]);
    expect(wrapper.find(".buscar__card-distancia").text()).toContain("25 km");
  });

  test("al pedir otra vez con otro lugar se actualizan las distancias", async () => {
    const espia = vi
      .spyOn(CuidadorRepository.prototype, "getCerca")
      .mockResolvedValueOnce(RESPUESTA_OVIEDO)
      .mockResolvedValueOnce({
        lugarEncontrado: true,
        distancias: [
          { cuidadorId: 1, km: 0 },
          { cuidadorId: 2, km: 470 },
        ],
      });
    const wrapper = await montarVista();

    await pedirCercania(wrapper, "Oviedo");
    await pedirCercania(wrapper, "Madrid");

    expect(espia).toHaveBeenCalledTimes(2);
    expect(nombresEnPantalla(wrapper)).toEqual(["Pepe", "Ana", "Luis", "Marta"]);
    expect(wrapper.find(".buscar__cerca-estado").text()).toContain("«Madrid»");
  });

  test("explica que el lugar escrito no se guarda", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".buscar__cerca-nota").text()).toContain("no se guarda");
  });

  test("el diseño de la distancia usa los colores de la paleta", () => {
    const codigo = readFileSync("src/views/family/BuscarView.vue", "utf-8");

    expect(codigo).toContain(".buscar__card-distancia");
    expect(codigo).toContain("var(--color-secondary-bg)");
  });
});
