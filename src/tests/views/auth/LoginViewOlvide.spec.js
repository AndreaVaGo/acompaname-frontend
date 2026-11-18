import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia } from "pinia";
import LoginView from "../../../views/auth/LoginView.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/login", component: LoginView },
    { path: "/olvide-password", component: { template: "<div />" } },
    { path: "/registro", component: { template: "<div />" } },
  ],
});

describe("LoginView: enlace para recuperar la contraseña", () => {
  test("enseña el enlace '¿Has olvidado tu contraseña?' que va a /olvide-password", () => {
    const wrapper = mount(LoginView, { global: { plugins: [router, createPinia()] } });

    const enlace = wrapper.find("a[href='/olvide-password']");
    expect(enlace.exists()).toBe(true);
    expect(enlace.text()).toBe("¿Has olvidado tu contraseña?");
  });

  test("el enlace está dentro del formulario, después del campo de contraseña", () => {
    const wrapper = mount(LoginView, { global: { plugins: [router, createPinia()] } });

    const html = wrapper.find("form").html();
    expect(html.indexOf("olvide-password")).toBeGreaterThan(html.indexOf('id="password"'));
  });
});
