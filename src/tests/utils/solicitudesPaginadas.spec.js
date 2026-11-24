import { describe, test, expect, vi } from "vitest";
import { usarSolicitudesPaginadas, TAMANO_PAGINA } from "../../utils/solicitudesPaginadas";
import { pagina } from "../ayudas/paginaFalsa";

function repositorioCon(...respuestas) {
  const getMisSolicitudesPaginadas = vi.fn();
  respuestas.forEach((respuesta) => {
    if (respuesta instanceof Error) {
      getMisSolicitudesPaginadas.mockRejectedValueOnce(respuesta);
    } else {
      getMisSolicitudesPaginadas.mockResolvedValueOnce(respuesta);
    }
  });
  return { getMisSolicitudesPaginadas };
}

const dosPaginas = {
  primera: pagina([{ id: 1 }, { id: 2 }], { pagina: 0, totalPaginas: 2, totalElementos: 3 }),
  segunda: pagina([{ id: 3 }], { pagina: 1, totalPaginas: 2, totalElementos: 3 }),
};

describe("usarSolicitudesPaginadas", () => {
  test("al empezar no hay solicitudes ni se ofrece cargar más", () => {
    const lista = usarSolicitudesPaginadas(repositorioCon());

    expect(lista.solicitudes.value).toEqual([]);
    expect(lista.hayMas.value).toBe(false);
  });

  test("la primera carga pide la página 0 con el tamaño normal", async () => {
    const repositorio = repositorioCon(dosPaginas.primera);
    const lista = usarSolicitudesPaginadas(repositorio);

    await lista.cargarSiguiente();

    expect(repositorio.getMisSolicitudesPaginadas).toHaveBeenCalledWith(0, TAMANO_PAGINA);
    expect(lista.solicitudes.value.map((s) => s.id)).toEqual([1, 2]);
    expect(lista.totalElementos.value).toBe(3);
    expect(lista.hayMas.value).toBe(true);
  });

  test("cargar más pide la página siguiente y la añade al final", async () => {
    const repositorio = repositorioCon(dosPaginas.primera, dosPaginas.segunda);
    const lista = usarSolicitudesPaginadas(repositorio);

    await lista.cargarSiguiente();
    await lista.cargarSiguiente();

    expect(repositorio.getMisSolicitudesPaginadas).toHaveBeenLastCalledWith(1, TAMANO_PAGINA);
    expect(lista.solicitudes.value.map((s) => s.id)).toEqual([1, 2, 3]);
    expect(lista.hayMas.value).toBe(false);
  });

  test("una solicitud que llega repetida no se duplica", async () => {
    const repetida = pagina([{ id: 2 }, { id: 3 }], { pagina: 1, totalPaginas: 2, totalElementos: 3 });
    const lista = usarSolicitudesPaginadas(repositorioCon(dosPaginas.primera, repetida));

    await lista.cargarSiguiente();
    await lista.cargarSiguiente();

    expect(lista.solicitudes.value.map((s) => s.id)).toEqual([1, 2, 3]);
  });

  test("si falla la primera carga avisa con el mensaje de siempre", async () => {
    const fallo = new Error("fallo");
    fallo.status = 404;
    const alFallar = vi.fn();
    const lista = usarSolicitudesPaginadas(repositorioCon(fallo), alFallar);

    await lista.cargarSiguiente();

    expect(alFallar).toHaveBeenCalledWith(
      "No se pudieron cargar tus solicitudes. No se ha encontrado lo que buscas.",
    );
    expect(lista.cargandoMas.value).toBe(false);
  });

  test("si falla cargar más avisa y conserva lo que ya estaba", async () => {
    const fallo = new Error("fallo");
    fallo.status = 500;
    const alFallar = vi.fn();
    const lista = usarSolicitudesPaginadas(repositorioCon(dosPaginas.primera, fallo), alFallar);

    await lista.cargarSiguiente();
    await lista.cargarSiguiente();

    expect(alFallar.mock.calls[0][0]).toContain("No se pudieron cargar más solicitudes.");
    expect(lista.solicitudes.value.map((s) => s.id)).toEqual([1, 2]);
    expect(lista.hayMas.value).toBe(true);
  });

  test("tras un fallo se puede volver a intentar la misma página", async () => {
    const fallo = new Error("fallo");
    fallo.status = 500;
    const repositorio = repositorioCon(dosPaginas.primera, fallo, dosPaginas.segunda);
    const lista = usarSolicitudesPaginadas(repositorio, () => {});

    await lista.cargarSiguiente();
    await lista.cargarSiguiente();
    await lista.cargarSiguiente();

    expect(repositorio.getMisSolicitudesPaginadas.mock.calls[1]).toEqual([1, TAMANO_PAGINA]);
    expect(repositorio.getMisSolicitudesPaginadas.mock.calls[2]).toEqual([1, TAMANO_PAGINA]);
    expect(lista.solicitudes.value.map((s) => s.id)).toEqual([1, 2, 3]);
  });
});
