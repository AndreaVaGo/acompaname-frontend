import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { readFileSync } from "node:fs";
import ChatView from "../../../views/common/ChatView.vue";
import MensajeRepository from "../../../repositories/MensajeRepository";
import { useAuthStore } from "../../../stores/auth";

const UNO = { id: 1, solicitudId: 5, emisorId: 2, emisorNombre: "Pepe", texto: "Hola, buenas", fecha: "2026-11-18T10:05:30", mio: false };
const DOS = { id: 2, solicitudId: 5, emisorId: 1, emisorNombre: "Ana", texto: "Buenas tardes", fecha: "2026-11-18T10:06:00", mio: true };

async function esperar() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function montarVista(rol = "FAMILIA") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/chat/:id", component: ChatView },
      { path: "/solicitudes", component: { template: "<div></div>" } },
      { path: "/solicitudes-cuidador", component: { template: "<div></div>" } },
    ],
  });
  router.push("/chat/5");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(ChatView, { global: { plugins: [pinia, router] } });
  const authStore = useAuthStore(pinia);
  authStore.login(1, "ana@test.com", "token", rol);
  await esperar();
  return wrapper;
}

describe("ChatView", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("carga y muestra los mensajes de la solicitud", async () => {
    const espia = vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([UNO, DOS]);

    const wrapper = await montarVista();

    expect(espia).toHaveBeenCalledWith("5");
    expect(wrapper.text()).toContain("Hola, buenas");
    expect(wrapper.text()).toContain("Buenas tardes");
    expect(wrapper.text()).toContain("nº 5");
  });

  test("marca como míos los mensajes propios y enseña el nombre solo del otro", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([UNO, DOS]);

    const wrapper = await montarVista();

    const burbujas = wrapper.findAll(".chat__mensaje");
    expect(burbujas[0].classes()).not.toContain("chat__mensaje--mio");
    expect(burbujas[0].text()).toContain("Pepe");
    expect(burbujas[1].classes()).toContain("chat__mensaje--mio");
    expect(burbujas[1].text()).not.toContain("Ana");
  });

  test("muestra la fecha y hora de cada mensaje", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([UNO]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("18-11-2026 · 10:05");
  });

  test("si no hay mensajes invita a escribir el primero", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Todavía no hay mensajes. ¡Escribe el primero!");
  });

  test("si falla la carga muestra el error", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockRejectedValue(new Error("fallo"));

    const wrapper = await montarVista();

    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  });

  test("el botón Enviar está desactivado si no hay texto", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.find(".chat__enviar").attributes("disabled")).toBeDefined();
    await wrapper.find("#chat-texto").setValue("   ");
    expect(wrapper.find(".chat__enviar").attributes("disabled")).toBeDefined();
  });

  test("enviar manda el texto sin espacios sobrantes, lo añade a la lista y vacía el campo", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);
    const espia = vi.spyOn(MensajeRepository.prototype, "enviar").mockResolvedValue(DOS);

    const wrapper = await montarVista();
    await wrapper.find("#chat-texto").setValue("  Buenas tardes  ");
    await wrapper.find("form").trigger("submit");
    await esperar();

    expect(espia).toHaveBeenCalledWith("5", "Buenas tardes");
    expect(wrapper.text()).toContain("Buenas tardes");
    expect(wrapper.find("#chat-texto").element.value).toBe("");
  });

  test("pulsar Enter envía el mensaje", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);
    const espia = vi.spyOn(MensajeRepository.prototype, "enviar").mockResolvedValue(DOS);

    const wrapper = await montarVista();
    await wrapper.find("#chat-texto").setValue("Hola");
    await wrapper.find("#chat-texto").trigger("keydown.enter");
    await esperar();

    expect(espia).toHaveBeenCalledTimes(1);
  });

  test("Mayús + Enter no envía el mensaje (salta de línea)", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);
    const espia = vi.spyOn(MensajeRepository.prototype, "enviar").mockResolvedValue(DOS);

    const wrapper = await montarVista();
    await wrapper.find("#chat-texto").setValue("Hola");
    await wrapper.find("#chat-texto").trigger("keydown.enter", { shiftKey: true });
    await esperar();

    expect(espia).not.toHaveBeenCalled();
  });

  test("si falla el envío muestra el error y conserva el texto escrito", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);
    vi.spyOn(MensajeRepository.prototype, "enviar").mockRejectedValue(new Error("fallo"));

    const wrapper = await montarVista();
    await wrapper.find("#chat-texto").setValue("Hola");
    await wrapper.find("form").trigger("submit");
    await esperar();

    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.find("#chat-texto").element.value).toBe("Hola");
  });

  test("cada pocos segundos pide solo los mensajes nuevos y los añade sin repetir", async () => {
    const espia = vi
      .spyOn(MensajeRepository.prototype, "getMensajes")
      .mockResolvedValueOnce([UNO])
      .mockResolvedValueOnce([DOS]);

    const wrapper = await montarVista();
    vi.advanceTimersByTime(4000);
    await esperar();

    expect(espia).toHaveBeenLastCalledWith("5", 1);
    expect(wrapper.findAll(".chat__mensaje")).toHaveLength(2);
  });

  test("no consulta si la pestaña está en segundo plano", async () => {
    const espia = vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([UNO]);
    const oculto = vi.spyOn(document, "hidden", "get").mockReturnValue(true);

    await montarVista();
    vi.advanceTimersByTime(8000);
    await esperar();

    expect(espia).toHaveBeenCalledTimes(1);
    oculto.mockRestore();
  });

  test("un fallo al buscar nuevos mensajes no muestra error ni borra la conversación", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes")
      .mockResolvedValueOnce([UNO])
      .mockRejectedValueOnce(new Error("sin red"));

    const wrapper = await montarVista();
    vi.advanceTimersByTime(4000);
    await esperar();

    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Hola, buenas");
  });

  test("al salir de la pantalla deja de consultar", async () => {
    const espia = vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([UNO]);

    const wrapper = await montarVista();
    wrapper.unmount();
    vi.advanceTimersByTime(12000);
    await esperar();

    expect(espia).toHaveBeenCalledTimes(1);
  });

  test("la familia vuelve a /solicitudes", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".chat__volver").attributes("href")).toBe("/solicitudes");
  });

  test("la persona cuidadora vuelve a /solicitudes-cuidador", async () => {
    vi.spyOn(MensajeRepository.prototype, "getMensajes").mockResolvedValue([]);

    const wrapper = await montarVista("CUIDADOR");

    expect(wrapper.find(".chat__volver").attributes("href")).toBe("/solicitudes-cuidador");
  });

  test("la lista de mensajes avisa a los lectores de pantalla y respeta movimiento reducido", () => {
    const codigo = readFileSync("src/views/common/ChatView.vue", "utf-8");

    expect(codigo).toContain('aria-live="polite"');
    expect(codigo).toContain("prefers-reduced-motion: reduce");
  });
});
