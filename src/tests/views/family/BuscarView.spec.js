import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import BuscarView from "../../../views/family/BuscarView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";

vi.spyOn(CuidadorRepository.prototype, "getAll").mockResolvedValue([
  {
    id: 1,
    usuarioNombre: "Pepe",
    especialidad: "Geriatría",
    tarifaHora: 15,
    tieneVehiculo: true,
    disponibleAhora: true,
    ciudad: "Oviedo",
    valoracionMedia: 4.7,
    numValoraciones: 3,
    tipoCuidado: "hospitalario",
    servicios: ["medicacion", "higiene"],
    sexo: "HOMBRE",
  },
  {
    id: 2,
    usuarioNombre: "Ana",
    especialidad: "Enfermería",
    tarifaHora: 20,
    tieneVehiculo: false,
    disponibleAhora: false,
    foto: "https://ejemplo.com/ana.jpg",
    ciudad: "Gijón",
    valoracionMedia: null,
    numValoraciones: 0,
    tipoCuidado: "domicilio",
    servicios: ["medicacion"],
    sexo: "MUJER",
  },
  {
    id: 3,
    usuarioNombre: "Luis",
    especialidad: "Fisioterapia",
    tarifaHora: 18,
    tieneVehiculo: false,
    disponibleAhora: false,
    ciudad: "Avilés",
    valoracionMedia: 3.5,
    numValoraciones: 2,
  },
]);

// Ana (id 2) es la cuidadora que tiene un servicio aceptado en esas fechas
const ocupadosFalso = vi
  .spyOn(SolicitudRepository.prototype, "getCuidadoresOcupados")
  .mockResolvedValue([2]);

beforeEach(() => {
  ocupadosFalso.mockClear();
});

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

describe("BuscarView", () => {
  test("muestra los cuidadores cargados", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Pepe");
  });

  test("muestra la foto si el cuidador la tiene", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const fotos = wrapper.findAll("img");
    expect(fotos.length).toBe(1);
    expect(fotos[0].attributes("src")).toBe("https://ejemplo.com/ana.jpg");
  });

  test("muestra la ciudad del cuidador en la tarjeta", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Oviedo");
    expect(wrapper.text()).toContain("Gijón");
  });

  test("filtra los cuidadores por ciudad", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-ciudad").setValue("oviedo");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("combina el filtro de ciudad con la búsqueda por texto", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-ciudad").setValue("Oviedo");
    await wrapper.find(".buscar__input").setValue("Enfermería");

    expect(wrapper.text()).not.toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
    expect(wrapper.text()).toContain("0 cuidadores");
  });

  test("el filtro Disponible ahora solo deja los cuidadores disponibles", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-disponible").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("el filtro Con vehículo propio solo deja los cuidadores con vehículo", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-vehiculo").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("volver a Cualquier disponibilidad vuelve a mostrar a todos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-disponible").trigger("click");
    await wrapper.find("#filtro-cualquier-disponibilidad").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Ana");
  });

  test("el botón del filtro elegido se marca como activo", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.find("#filtro-indiferente").classes()).toContain(
      "buscar__filter-btn--active",
    );

    await wrapper.find("#filtro-vehiculo").trigger("click");

    expect(wrapper.find("#filtro-vehiculo").classes()).toContain(
      "buscar__filter-btn--active",
    );
    expect(wrapper.find("#filtro-indiferente").classes()).not.toContain(
      "buscar__filter-btn--active",
    );
  });

  test("muestra la valoración media y cuántas valoraciones tiene", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("4.7 (3 valoraciones)");
    expect(wrapper.text()).toContain("3.5 (2 valoraciones)");
  });

  test("la valoración lleva al perfil con la lista de valoraciones abierta", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const enlaces = wrapper.findAll(".buscar__card-valoracion-enlace");
    expect(enlaces[0].attributes("href")).toBe("/cuidador/1?valoraciones=1");
    expect(enlaces[0].text()).toContain("4.7");
  });

  test("sin valoraciones no hay enlace a la lista", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Pepe y Luis tienen valoraciones; Ana no
    expect(wrapper.findAll(".buscar__card-valoracion-enlace").length).toBe(2);
  });

  test("avisa si el cuidador todavía no tiene valoraciones", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Sin valoraciones todavía");
  });

  test("el filtro de valoración mínima 4 solo deja a los que llegan a 4", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-valoracion-4").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).not.toContain("Luis");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("el filtro de valoración mínima 3 deja fuera a los que no tienen valoraciones", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-valoracion-3").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("volver a Cualquiera en valoración vuelve a mostrar a todos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-valoracion-4").trigger("click");
    await wrapper.find("#filtro-valoracion-0").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.text()).toContain("Ana");
  });

  test("muestra el tipo de cuidado en la tarjeta (sin dato cuenta como ambos)", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const etiquetas = wrapper.findAll(".buscar__tag--tipo");
    expect(etiquetas.length).toBe(3);
    expect(etiquetas[0].text()).toBe("Hospitalario");
    expect(etiquetas[1].text()).toBe("A domicilio");
    expect(etiquetas[2].text()).toBe("Hospital y domicilio");
  });

  test("el filtro Hospitalario deja a los hospitalarios y a los que hacen ambos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-tipo-hospitalario").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("el filtro A domicilio deja a los de domicilio y a los que hacen ambos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-tipo-domicilio").trigger("click");

    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.text()).not.toContain("Pepe");
  });

  test("volver a Todos en tipo de cuidado vuelve a mostrar a todos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-tipo-domicilio").trigger("click");
    await wrapper.find("#filtro-tipo-todos").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.find("#filtro-tipo-todos").classes()).toContain(
      "buscar__filter-btn--active",
    );
  });

  test("muestra los servicios del cuidador en la tarjeta", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const etiquetas = wrapper.findAll(".buscar__tag--servicio");
    expect(etiquetas.length).toBe(3);
    expect(etiquetas[0].text()).toBe("Medicación");
    expect(etiquetas[1].text()).toBe("Higiene personal");
    expect(etiquetas[2].text()).toBe("Medicación");
  });

  test("el filtro de un servicio solo deja a los que lo ofrecen", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-servicio-medicacion").setValue(true);

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).not.toContain("Luis");
  });

  test("con dos servicios marcados solo salen los que ofrecen los dos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-servicio-medicacion").setValue(true);
    await wrapper.find("#filtro-servicio-higiene").setValue(true);

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
    expect(wrapper.text()).not.toContain("Luis");
  });

  test("al desmarcar los servicios vuelven a salir todos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-servicio-medicacion").setValue(true);
    await wrapper.find("#filtro-servicio-medicacion").setValue(false);

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Luis");
  });

  test("el filtro Mujer solo deja a las cuidadoras que lo han indicado", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-sexo-mujer").trigger("click");

    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).not.toContain("Pepe");
    expect(wrapper.text()).not.toContain("Luis");
  });

  test("el filtro Hombre solo deja a los cuidadores que lo han indicado", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-sexo-hombre").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
    expect(wrapper.text()).not.toContain("Luis");
  });

  test("volver a Cualquiera en sexo vuelve a mostrar a todos, también a quien no lo indicó", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-sexo-mujer").trigger("click");
    await wrapper.find("#filtro-sexo-todos").trigger("click");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.find("#filtro-sexo-todos").classes()).toContain(
      "buscar__filter-btn--active",
    );
  });

  test("combina el filtro de sexo con el de servicios", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-sexo-mujer").trigger("click");
    await wrapper.find("#filtro-servicio-higiene").setValue(true);

    expect(wrapper.text()).not.toContain("Ana");
    expect(wrapper.text()).toContain("0 cuidadores");
  });

  test("sin fechas no se consulta qué cuidadores están ocupados", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(ocupadosFalso).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Ana");
  });

  test("al elegir la fecha de inicio se ocultan los cuidadores ocupados", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-fecha-desde").setValue("2026-11-01");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(ocupadosFalso).toHaveBeenCalledWith("2026-11-01", "");
    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("con fecha de inicio y de fin se consultan las dos fechas", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-fecha-desde").setValue("2026-11-01");
    await wrapper.find("#filtro-fecha-hasta").setValue("2026-11-05");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(ocupadosFalso).toHaveBeenLastCalledWith("2026-11-01", "2026-11-05");
  });

  test("al borrar la fecha de inicio vuelven a salir todos", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-fecha-desde").setValue("2026-11-01");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.find("#filtro-fecha-desde").setValue("");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Luis");
  });

  test("si la fecha de fin es anterior a la de inicio avisa y no consulta", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-fecha-hasta").setValue("2026-11-01");
    await wrapper.find("#filtro-fecha-desde").setValue("2026-11-05");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(ocupadosFalso).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain(
      "La fecha de fin no puede ser anterior a la de inicio",
    );
    expect(wrapper.text()).toContain("Ana");
  });

  test("si falla la consulta de fechas avisa y muestra a todos", async () => {
    ocupadosFalso.mockRejectedValueOnce(new Error("fallo"));
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-fecha-desde").setValue("2026-11-01");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain(
      "No se pudo comprobar la disponibilidad por fechas",
    );
    expect(wrapper.text()).toContain("Ana");
  });

  test("si falla la carga de cuidadores avisa en la pantalla", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getAll").mockRejectedValueOnce(
      new Error("fallo"),
    );
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No se pudieron cargar los cuidadores.");
  });

  test("muestra el motivo si el servidor responde con un error al cargar los cuidadores", async () => {
    const errorNoEncontrado = new Error("fallo");
    errorNoEncontrado.status = 404;
    vi.spyOn(CuidadorRepository.prototype, "getAll").mockRejectedValueOnce(
      errorNoEncontrado,
    );
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain(
      "No se pudieron cargar los cuidadores. No se ha encontrado lo que buscas.",
    );
  });

  test("muestra el motivo si el servidor responde con un error al comprobar las fechas", async () => {
    const errorNoEncontrado = new Error("fallo");
    errorNoEncontrado.status = 404;
    ocupadosFalso.mockRejectedValueOnce(errorNoEncontrado);
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-fecha-desde").setValue("2026-11-01");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain(
      "No se pudo comprobar la disponibilidad por fechas. No se ha encontrado lo que buscas.",
    );
  });
});