import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import ConfirmacionView from "../../../views/family/ConfirmacionView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import fuente from "../../../views/family/ConfirmacionView.vue?raw";

// ACOM-198: la pantalla de confirmación dibuja un tic y las filas del resumen entran una tras otra
const solicitud = {
  id: 9,
  cuidadorNombre: "Pepe",
  tipoCuidado: "domicilio",
  fechaCuidado: "2030-01-10",
  horaInicio: "09:00:00",
  fechaFin: null,
  horaFin: "12:00:00",
  nombrePaciente: "Antonio Serrano",
  edadPaciente: 81,
};

async function montarVista() {
  vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue(solicitud);
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/confirmacion", component: ConfirmacionView },
      { path: "/solicitudes", component: { template: "<div />" } },
      { path: "/buscar", component: { template: "<div />" } },
    ],
  });
  await router.push("/confirmacion?id=9");
  await router.isReady();
  const wrapper = mount(ConfirmacionView, { global: { plugins: [router] } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ConfirmacionView · movimiento", () => {
  test("el icono lleva un círculo y un tic dibujados con trazos", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find('[data-testid="confirmacion-icono"] svg').exists()).toBe(true);
    expect(wrapper.find(".confirmacion__circulo").exists()).toBe(true);
    expect(wrapper.find(".confirmacion__tic").exists()).toBe(true);
  });

  test("el icono es decoración: los lectores de pantalla no lo leen", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find('[data-testid="confirmacion-icono"]').attributes("aria-hidden")).toBe("true");
  });

  test("el título sigue diciendo que la solicitud se ha enviado", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find("h1").text()).toBe("Solicitud enviada");
  });

  test("las filas del resumen siguen estando", async () => {
    const wrapper = await montarVista();

    expect(wrapper.findAll(".confirmacion__fila").length).toBeGreaterThanOrEqual(3);
  });

  test("los botones de después de enviar siguen funcionando como enlaces", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find('a[href="/solicitudes"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/buscar"]').exists()).toBe(true);
  });
});

// jsdom no pinta CSS, así que se comprueba en el código que el movimiento se desactiva
describe("ConfirmacionView · movimiento: estilos", () => {
  const bloqueReducido = fuente.slice(fuente.indexOf("@media (prefers-reduced-motion: reduce)"));

  test("con menos movimiento se quitan la animación del icono, de los trazos y de las filas", () => {
    expect(bloqueReducido).toContain(".confirmacion__icon");
    expect(bloqueReducido).toContain(".confirmacion__circulo");
    expect(bloqueReducido).toContain(".confirmacion__tic");
    expect(bloqueReducido).toContain(".confirmacion__fila");
    expect(bloqueReducido).toContain("animation: none");
  });

  test("sin animación el tic queda dibujado: el trazo completo es el valor normal", () => {
    // Solo los fotogramas "from" cambian el trazo; el estado normal es el dibujo entero
    expect(fuente).not.toMatch(/\.confirmacion__tic \{[^}]*stroke-dashoffset/);
    expect(fuente).not.toMatch(/\.confirmacion__circulo \{[^}]*stroke-dashoffset/);
  });

  test("las filas entran escalonadas, cada una un poco después de la anterior", () => {
    expect(fuente).toContain(".confirmacion__fila:nth-child(2)");
    expect(fuente).toContain(".confirmacion__fila:nth-child(5)");
  });
});
