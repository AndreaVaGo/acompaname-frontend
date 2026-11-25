import { describe, test, expect } from "vitest";
import { EMAIL_CONTACTO } from "../../../utils/contacto";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import PrivacidadView from "../../../views/common/PrivacidadView.vue";

function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/aviso-legal", component: { template: "<div />" } }],
  });

  return mount(PrivacidadView, {
    global: {
      plugins: [router],
    },
  });
}

describe("PrivacidadView", () => {
  test("muestra el título de la política de privacidad", () => {
    const wrapper = montarVista();

    expect(wrapper.find("h1").text()).toBe("Política de privacidad");
  });

  test("no usa «cuidador» ni «cuidadores» sueltos", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).not.toMatch(/\bcuidadores?\b/i);
  });

  test("dice persona cuidadora al explicar el rol y las valoraciones", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("rol (familia o persona cuidadora)");
    expect(wrapper.text()).toContain("perfil de la persona cuidadora y muestran");
  });

  test("indica quién es el responsable y cómo contactar", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Andrea V.G.");
    expect(wrapper.find("a[href^='mailto:']").exists()).toBe(true);
  });

  test("explica que no se usan cookies", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("no utiliza cookies");
  });

  test("aclara que las cookies que no usa son las propias", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("no utiliza cookies propias");
  });

  test("informa de los derechos y de la AEPD", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("acceso, rectificación, supresión");
    expect(wrapper.find("a[href='https://www.aepd.es']").exists()).toBe(true);
  });

  test("enlaza con el aviso legal", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href='/aviso-legal']").exists()).toBe(true);
  });

  test("el enlace de contacto usa el correo común", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href^='mailto:']").attributes("href")).toBe(
      "mailto:" + EMAIL_CONTACTO,
    );
  });

  test("explica los fichajes y que no se guardan coordenadas", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Fichajes del servicio");
    expect(wrapper.text()).toContain("No guardamos coordenadas ni recorridos");
  });

  test("explica el uso puntual de la ubicación y el servicio de mapas", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("solo en el momento de fichar");
    expect(wrapper.text()).toContain("Nominatim");
    expect(wrapper.text()).toContain("no se almacena");
  });

  test("informa del uso de Cloudflare Turnstile en el registro y el inicio de sesión", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Cloudflare Turnstile");
    expect(wrapper.text()).toContain("En el registro y en el inicio de sesión");
    expect(wrapper.text()).toContain("recibe datos técnicos de tu navegador");
  });

  test("informa de la dirección IP de los intentos fallidos y de su plazo de 30 días", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Datos técnicos de seguridad");
    expect(wrapper.text()).toContain("intentos fallidos de inicio de sesión");
    expect(wrapper.text()).toContain("durante 30 días");
  });

  test("explica qué pasa con los datos al eliminar la cuenta", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Si eliminas tu cuenta, se borran tus datos personales");
    expect(wrapper.text()).toContain("asociados a una cuenta anónima");
  });

  test("informa de que el lugar de la búsqueda se envía a Nominatim desde el servidor", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("cerca de un lugar");
    expect(wrapper.text()).toContain("Nominatim no recibe los datos de tu cuenta");
  });
});
