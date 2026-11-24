import { ref, computed } from "vue";
import { mensajeDeError } from "./mensajeDeError";

// Cuántas solicitudes se piden cada vez (el servidor no devuelve más de 50 aunque se pida)
export const TAMANO_PAGINA = 20;

// Lista de solicitudes que se va completando de página en página ("Cargar más").
// repository es un SolicitudRepository; alFallar recibe el texto del error para enseñarlo.
export function usarSolicitudesPaginadas(repository, alFallar) {
  const solicitudes = ref([]);
  const totalElementos = ref(0);
  const totalPaginas = ref(0);
  // Última página que ya está cargada (-1: todavía ninguna)
  const paginaCargada = ref(-1);
  const cargandoMas = ref(false);

  const hayMas = computed(() => paginaCargada.value + 1 < totalPaginas.value);

  async function cargarSiguiente() {
    const esLaPrimera = paginaCargada.value < 0;
    cargandoMas.value = true;
    try {
      const pagina = await repository.getMisSolicitudesPaginadas(
        paginaCargada.value + 1,
        TAMANO_PAGINA,
      );
      // Si entre una página y otra se creó una solicitud nueva, una puede repetirse: no se duplica
      const yaEstan = new Set(solicitudes.value.map((solicitud) => solicitud.id));
      const nuevas = pagina.contenido.filter((solicitud) => !yaEstan.has(solicitud.id));
      solicitudes.value = [...solicitudes.value, ...nuevas];
      paginaCargada.value = pagina.pagina;
      totalPaginas.value = pagina.totalPaginas;
      totalElementos.value = pagina.totalElementos;
    } catch (err) {
      const contexto = esLaPrimera
        ? "No se pudieron cargar tus solicitudes."
        : "No se pudieron cargar más solicitudes.";
      if (alFallar) {
        alFallar(mensajeDeError(err, contexto));
      }
    } finally {
      cargandoMas.value = false;
    }
  }

  return { solicitudes, totalElementos, hayMas, cargandoMas, cargarSiguiente };
}
