import { describe, test, expect } from "vitest";
import { mount, RouterLinkStub } from "@vue/test-utils";
import SolicitudCard from "../../components/SolicitudCard.vue";
import AdminSolicitudes from "../../components/admin/AdminSolicitudes.vue";

// ACOM-240: cada tipo de cuidado lleva su icono (antes todas las solicitudes llevaban la casa)
function tarjeta(tipoCuidado) {
  return mount(SolicitudCard, {
    props: {
      solicitud: {
        id: 1,
        nombrePaciente: "Antonio Serrano",
        tipoCuidado,
        fechaCuidado: "2026-08-12",
        notas: "Notas",
        estado: "PENDIENTE",
      },
      nombreMostrado: "Familia Serrano",
      mostrarAcciones: false,
    },
    global: { stubs: { RouterLink: RouterLinkStub } },
  });
}

describe("Icono del tipo de cuidado", () => {
  test("una solicitud de hospital lleva el hospital, no la casa", () => {
    const texto = tarjeta("hospitalario").find(".solicitudes__tipo").text();

    expect(texto).toContain("🏥");
    expect(texto).not.toContain("🏠");
  });

  test("una solicitud a domicilio lleva la casa", () => {
    const texto = tarjeta("domicilio").find(".solicitudes__tipo").text();

    expect(texto).toContain("🏠");
    expect(texto).not.toContain("🏥");
  });

  test("en el panel de administración la píldora del tipo lleva su icono", () => {
    const wrapper = mount(AdminSolicitudes, {
      props: {
        solicitudes: [
          {
            id: 1,
            estado: "PENDIENTE",
            tipoCuidado: "hospitalario",
            nombrePaciente: "Rosa",
            nombreFamilia: "Ana",
            nombreCuidador: "Pepe",
            fechaCuidado: "2026-08-12",
          },
          {
            id: 2,
            estado: "PENDIENTE",
            tipoCuidado: "domicilio",
            nombrePaciente: "Juan",
            nombreFamilia: "Luis",
            nombreCuidador: "Marta",
            fechaCuidado: "2026-08-13",
          },
        ],
        estado: "",
      },
    });
    const iconos = wrapper
      .findAll("[data-icono]")
      .map((e) => e.attributes("data-icono"));

    expect(iconos).toEqual(expect.arrayContaining(["🏥", "🏠"]));
  });
});
