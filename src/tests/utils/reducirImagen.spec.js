import { describe, test, expect, vi, afterEach } from "vitest";
import { reducirImagen } from "../../utils/reducirImagen";

// Dibujo falso: el "canvas" de mentira que usa la función
function prepararCanvas() {
  const dibujo = {
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue(dibujo),
    toDataURL: vi.fn().mockReturnValue("data:imagen-reducida"),
  };
  vi.spyOn(document, "createElement").mockReturnValue(canvas);
  return { canvas, dibujo };
}

// Lector falso: al leer el archivo, avisa de que terminó bien
function prepararLector() {
  vi.stubGlobal(
    "FileReader",
    class {
      readAsDataURL() {
        this.result = "data:archivo-leido";
        this.onload();
      }
    },
  );
}

// Imagen falsa: al poner el src, avisa de que se cargó con el tamaño indicado
function prepararImagen(ancho, alto) {
  vi.stubGlobal(
    "Image",
    class {
      set src(valor) {
        this.width = ancho;
        this.height = alto;
        this.onload();
      }
    },
  );
}

describe("reducirImagen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("reduce una imagen grande a un máximo de 300 píxeles", async () => {
    const { canvas } = prepararCanvas();
    prepararLector();
    prepararImagen(600, 300);

    const resultado = await reducirImagen({});

    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(150);
    expect(resultado).toBe("data:imagen-reducida");
  });

  test("no agranda una imagen que ya es pequeña", async () => {
    const { canvas } = prepararCanvas();
    prepararLector();
    prepararImagen(100, 50);

    await reducirImagen({});

    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(50);
  });

  test("pinta el fondo de blanco y dibuja la imagen", async () => {
    const { dibujo } = prepararCanvas();
    prepararLector();
    prepararImagen(600, 300);

    await reducirImagen({});

    expect(dibujo.fillStyle).toBe("#ffffff");
    expect(dibujo.fillRect).toHaveBeenCalled();
    expect(dibujo.drawImage).toHaveBeenCalled();
  });

  test("si no se puede leer el archivo, devuelve un error", async () => {
    prepararCanvas();
    vi.stubGlobal(
      "FileReader",
      class {
        readAsDataURL() {
          this.onerror();
        }
      },
    );

    await expect(reducirImagen({})).rejects.toThrow("No se pudo leer la imagen");
  });

  test("si no se puede abrir la imagen, devuelve un error", async () => {
    prepararCanvas();
    prepararLector();
    vi.stubGlobal(
      "Image",
      class {
        set src(valor) {
          this.onerror();
        }
      },
    );

    await expect(reducirImagen({})).rejects.toThrow("No se pudo abrir la imagen");
  });
});