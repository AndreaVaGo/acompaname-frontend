import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de cristal en el chat y en la pantalla de valorar
const chat = readFileSync("src/views/common/ChatView.vue", "utf-8");
const valorar = readFileSync("src/views/family/ValorarView.vue", "utf-8");

describe("ChatView · diseño", () => {
  test("usa el fondo animado y la caja de cristal globales", () => {
    expect(chat).toContain('class="chat pantalla"');
    expect(chat).toContain('class="chat__caja tarjeta-cristal"');
  });

  test("la caja del chat no se mueve ni brilla al pasar el ratón", () => {
    const bloque = chat.slice(chat.indexOf(".chat__caja:hover"));

    expect(bloque.slice(0, 120)).toContain("transform: none");
    expect(chat).toContain(".chat__caja::after");
  });

  test("mis mensajes llevan degradado coral", () => {
    const bloque = chat.slice(chat.indexOf(".chat__mensaje--mio {"));

    expect(bloque.slice(0, 250)).toContain("linear-gradient(135deg");
  });

  test("el contenedor no pone fondo propio, para que se vea el fondo animado", () => {
    const bloque = chat.slice(chat.indexOf(".chat {"), chat.indexOf(".chat__volver"));

    expect(bloque).not.toContain("background-color");
  });
});

describe("ValorarView · diseño", () => {
  test("usa el fondo animado y la tarjeta de cristal globales", () => {
    expect(valorar).toContain('class="valorar pantalla"');
    expect(valorar).toContain('class="valorar__box tarjeta-cristal"');
  });

  test("el contenedor no pone fondo propio", () => {
    const bloque = valorar.slice(valorar.indexOf(".valorar {"), valorar.indexOf(".valorar__wrapper"));

    expect(bloque).not.toContain("background-color");
  });

  test("las estrellas crecen y giran un poco al pasar el ratón", () => {
    expect(valorar).toContain("transform: scale(1.25) rotate(-8deg)");
    expect(valorar).toContain("transform var(--dur-fast) var(--ease-out)");
  });
});
