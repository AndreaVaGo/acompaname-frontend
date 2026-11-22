import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AdminVerificaciones from "../../../components/admin/AdminVerificaciones.vue";

const VERIFICACIONES = [
  {
    id: 1,
    cuidadorId: 3,
    cuidadorNombre: "Pepe",
    tipo: "TITULACION",
    estado: "PENDIENTE",
    referencia: "COL-12345",
    solicitadaEn: "2026-11-22T10:05:00",
    revisadaEn: null,
    motivoRechazo: null,
  },
  {
    id: 2,
    cuidadorId: 4,
    cuidadorNombre: "Lucía",
    tipo: "ANTECEDENTES",
    estado: "VERIFICADO",
    referencia: "SD:ABC123",
    solicitadaEn: "2026-11-20T09:00:00",
    revisadaEn: "2026-11-21T09:00:00",
    motivoRechazo: null,
  },
  {
    id: 3,
    cuidadorId: 5,
    cuidadorNombre: "Luis",
    tipo: "TITULACION",
    estado: "RECHAZADO",
    referencia: "XX",
    solicitadaEn: "2026-11-19T09:00:00",
    revisadaEn: "2026-11-19T12:00:00",
    motivoRechazo: "No existe",
  },
];

function montar(verificaciones = VERIFICACIONES) {
  return mount(AdminVerificaciones, { props: { verificaciones } });
}

describe("AdminVerificaciones", () => {
  test("por defecto solo enseña las pendientes", () => {
    const wrapper = montar();
    const tarjetas = wrapper.findAll('[data-testid="verificacion"]');

    expect(tarjetas).toHaveLength(1);
    expect(tarjetas[0].text()).toContain("Pepe");
    expect(tarjetas[0].text()).toContain("COL-12345");
    expect(tarjetas[0].text()).toContain("22-11-2026 · 10:05");
  });

  test("los botones de filtro llevan su contador", () => {
    const wrapper = montar();

    expect(wrapper.find('[data-testid="filtro-pendientes"]').text()).toBe("Pendientes (1)");
    expect(wrapper.find('[data-testid="filtro-todas"]').text()).toBe("Todas (3)");
  });

  test("'Todas' enseña también las resueltas, con el motivo del rechazo", async () => {
    const wrapper = montar();

    await wrapper.find('[data-testid="filtro-todas"]').trigger("click");

    expect(wrapper.findAll('[data-testid="verificacion"]')).toHaveLength(3);
    expect(wrapper.text()).toContain("Motivo del rechazo: No existe");
  });

  test("solo las pendientes tienen botones de aprobar y rechazar", async () => {
    const wrapper = montar();
    await wrapper.find('[data-testid="filtro-todas"]').trigger("click");

    expect(wrapper.findAll('[data-testid="aprobar"]')).toHaveLength(1);
    expect(wrapper.findAll('[data-testid="rechazar"]')).toHaveLength(1);
  });

  test("aprobar avisa con el id y sin motivo", async () => {
    const wrapper = montar();

    await wrapper.find('[data-testid="aprobar"]').trigger("click");

    expect(wrapper.emitted("resolver")[0][0]).toEqual({ id: 1, aprobar: true, motivo: "" });
  });

  test("rechazar avisa con el motivo escrito, sin espacios", async () => {
    const wrapper = montar();

    await wrapper.find("input").setValue("  No lo encuentro  ");
    await wrapper.find('[data-testid="rechazar"]').trigger("click");

    expect(wrapper.emitted("resolver")[0][0]).toEqual({
      id: 1,
      aprobar: false,
      motivo: "No lo encuentro",
    });
  });

  test("rechazar sin escribir motivo lo manda vacío", async () => {
    const wrapper = montar();

    await wrapper.find('[data-testid="rechazar"]').trigger("click");

    expect(wrapper.emitted("resolver")[0][0].motivo).toBe("");
  });

  test("sin pendientes dice que no hay pendientes", () => {
    const wrapper = montar([VERIFICACIONES[1]]);

    expect(wrapper.text()).toContain("No hay verificaciones pendientes.");
  });

  test("sin ninguna dice que no hay todavía", async () => {
    const wrapper = montar([]);
    await wrapper.find('[data-testid="filtro-todas"]').trigger("click");

    expect(wrapper.text()).toContain("No hay verificaciones todavía.");
  });

  test("una fecha vacía no rompe la tarjeta", () => {
    const wrapper = montar([{ ...VERIFICACIONES[0], solicitadaEn: null }]);

    expect(wrapper.findAll('[data-testid="verificacion"]')).toHaveLength(1);
  });
});
