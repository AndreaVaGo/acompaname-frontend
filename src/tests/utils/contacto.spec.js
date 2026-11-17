import { describe, test, expect } from "vitest";
import { EMAIL_CONTACTO } from "../../utils/contacto";

describe("EMAIL_CONTACTO", () => {
  test("tiene forma de correo electrónico", () => {
    expect(EMAIL_CONTACTO).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});
