<script setup>
import { ref, computed, onMounted } from "vue";
import FichajeRepository from "@/repositories/FichajeRepository";
import { pedirUbicacion } from "@/utils/ubicacionNavegador";
import { horaDeMomento } from "@/utils/formatearHora";
import { formatearFecha } from "@/utils/formatearFecha";
import { mensajeDeError } from "@/utils/mensajeDeError";

// Inicio y fin del servicio. La persona cuidadora ficha con dos botones;
// la familia solo ve a qué hora empezó y terminó.
const props = defineProps(["solicitud", "esCuidador"]);

const repository = new FichajeRepository();
const fichajes = ref([]);
// Si está activado, al fichar se pide la ubicación (una vez) para comprobar que está en el lugar
const verificarLugar = ref(false);
const ocupado = ref(false);
const error = ref("");
const aviso = ref("");

const inicio = computed(() => fichajes.value.find((f) => f.tipo === "INICIO"));
const fin = computed(() => fichajes.value.find((f) => f.tipo === "FIN"));

// Solo se ficha en un servicio aceptado, y solo lo hace la persona cuidadora
const puedeFichar = computed(
  () => props.esCuidador && props.solicitud.estado === "ACEPTADA",
);

// Hoy en formato 2026-11-24 con la hora local (el servidor no deja fichar el inicio antes de ese día)
function hoy() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

const esPronto = computed(
  () => !inicio.value && hoy() < props.solicitud.fechaCuidado,
);

function textoUbicacion(fichaje) {
  if (fichaje.ubicacion === "EN_EL_LUGAR") {
    return "en el lugar ✓";
  }
  if (fichaje.ubicacion === "FUERA_DEL_LUGAR") {
    return "lejos de la dirección del servicio";
  }
  return "";
}

onMounted(async () => {
  try {
    fichajes.value = await repository.getFichajes(props.solicitud.id);
  } catch (err) {
    // Si falla, la tarjeta se ve igual; solo no salen las horas
    fichajes.value = [];
  }
  if (puedeFichar.value) {
    try {
      const configuracion = await repository.getConfiguracion();
      verificarLugar.value = configuracion.verificarLugar === true;
    } catch (err) {
      verificarLugar.value = false;
    }
  }
});

async function fichar(tipo) {
  ocupado.value = true;
  error.value = "";
  aviso.value = "";
  try {
    let ubicacion = {};
    if (verificarLugar.value) {
      try {
        ubicacion = await pedirUbicacion();
      } catch (err) {
        // Sin permiso o sin ubicación se ficha igual, solo con la hora
        aviso.value =
          "No se ha podido usar tu ubicación; se ha guardado solo la hora.";
      }
    }
    let nuevo;
    if (tipo === "INICIO") {
      nuevo = await repository.empezar(props.solicitud.id, ubicacion);
    } else {
      nuevo = await repository.terminar(props.solicitud.id, ubicacion);
    }
    fichajes.value = [...fichajes.value, nuevo];
  } catch (err) {
    aviso.value = "";
    error.value = mensajeDeError(
      err,
      tipo === "INICIO"
        ? "No se pudo fichar el inicio del servicio."
        : "No se pudo fichar el fin del servicio.",
    );
  } finally {
    ocupado.value = false;
  }
}
</script>

<template>
  <div class="fichaje" data-testid="fichaje">
    <p v-if="inicio" class="fichaje__linea" data-testid="fichaje-inicio">
      ▶️ Servicio iniciado a las {{ horaDeMomento(inicio.momento) }}
      <span v-if="textoUbicacion(inicio)">, {{ textoUbicacion(inicio) }}</span>
    </p>
    <p v-if="fin" class="fichaje__linea" data-testid="fichaje-fin">
      ⏹️ Servicio terminado a las {{ horaDeMomento(fin.momento) }}
      <span v-if="textoUbicacion(fin)">, {{ textoUbicacion(fin) }}</span>
    </p>

    <template v-if="puedeFichar && !fin">
      <button
        v-if="!inicio"
        class="btn btn--primary"
        data-testid="fichar-inicio"
        :disabled="ocupado || esPronto"
        @click="fichar('INICIO')"
      >
        Empiezo el servicio
      </button>
      <button
        v-else
        class="btn btn--primary"
        data-testid="fichar-fin"
        :disabled="ocupado"
        @click="fichar('FIN')"
      >
        Termino el servicio
      </button>

      <p v-if="esPronto" class="fichaje__nota">
        Podrás empezar el {{ formatearFecha(solicitud.fechaCuidado) }}.
      </p>
      <p v-else-if="verificarLugar" class="fichaje__nota" data-testid="aviso-ubicacion">
        Al fichar, el navegador te pedirá tu ubicación. Se usa solo en ese
        momento para comprobar que estás en el lugar del servicio y no se guarda.
      </p>
    </template>

    <p v-if="aviso" class="fichaje__nota" data-testid="fichaje-aviso">{{ aviso }}</p>
    <p v-if="error" role="alert" class="fichaje__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.fichaje {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 12px;
}

.fichaje:empty {
  display: none;
}

.fichaje__linea {
  margin: 0;
  font-size: 0.9rem;
}

.fichaje__nota {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.fichaje__error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-error);
}
</style>
