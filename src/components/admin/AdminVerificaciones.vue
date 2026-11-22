<script setup>
import { ref, computed } from "vue";
import { formatearFecha } from "@/utils/formatearFecha";
import {
  nombreTipoVerificacion,
  nombreEstadoVerificacion,
} from "@/utils/catalogoVerificaciones";

// Pruebas que han enviado las personas cuidadoras (titulación y antecedentes).
// El administrador comprueba la referencia en la web oficial y la aprueba o la rechaza.
// Solo se puede resolver una que esté pendiente.
const props = defineProps({
  verificaciones: { type: Array, required: true },
});

const emit = defineEmits(["resolver"]);

// "PENDIENTE" o "" (todas). Por defecto, lo que hay que revisar
const estadoElegido = ref("PENDIENTE");
// Motivo escrito para cada verificación, según su id
const motivos = ref({});

function cuantas(estado) {
  if (estado === "") {
    return props.verificaciones.length;
  }
  return props.verificaciones.filter((v) => v.estado === estado).length;
}

const mostradas = computed(() => {
  if (estadoElegido.value === "") {
    return props.verificaciones;
  }
  return props.verificaciones.filter((v) => v.estado === estadoElegido.value);
});

// La fecha llega como 2026-11-22T10:00:00: se muestra 22-11-2026 · 10:00
function fechaYHora(fecha) {
  if (!fecha) {
    return "";
  }
  return formatearFecha(fecha.slice(0, 10)) + " · " + fecha.slice(11, 16);
}

function aprobar(verificacion) {
  emit("resolver", { id: verificacion.id, aprobar: true, motivo: "" });
}

function rechazar(verificacion) {
  emit("resolver", {
    id: verificacion.id,
    aprobar: false,
    motivo: (motivos.value[verificacion.id] || "").trim(),
  });
}
</script>

<template>
  <section class="admin-verif" data-testid="admin-verificaciones">
    <header class="admin-verif__cabecera">
      <h2 class="admin-verif__titulo">Verificaciones</h2>
      <p class="admin-verif__subtitulo">
        Comprueba cada referencia en la web oficial (colegio profesional o sede
        electrónica del Ministerio de Justicia) y apruébala o recházala. Al
        aprobarla, las familias verán la insignia «verificado».
      </p>
    </header>

    <div class="admin-verif__filtros" role="group" aria-label="Filtrar por estado">
      <button
        type="button"
        class="admin-verif__filtro"
        :class="{ 'admin-verif__filtro--activo': estadoElegido === 'PENDIENTE' }"
        data-testid="filtro-pendientes"
        @click="estadoElegido = 'PENDIENTE'"
      >
        Pendientes ({{ cuantas("PENDIENTE") }})
      </button>
      <button
        type="button"
        class="admin-verif__filtro"
        :class="{ 'admin-verif__filtro--activo': estadoElegido === '' }"
        data-testid="filtro-todas"
        @click="estadoElegido = ''"
      >
        Todas ({{ cuantas("") }})
      </button>
    </div>

    <p class="admin-verif__vacio" v-if="mostradas.length === 0">
      No hay verificaciones {{ estadoElegido === "PENDIENTE" ? "pendientes" : "todavía" }}.
    </p>

    <ul class="admin-verif__lista" v-else>
      <li
        v-for="verificacion in mostradas"
        :key="verificacion.id"
        class="admin-verif__tarjeta"
        data-testid="verificacion"
      >
        <div class="admin-verif__fila">
          <strong>{{ verificacion.cuidadorNombre }}</strong>
          <span
            class="admin-verif__estado"
            :class="'admin-verif__estado--' + verificacion.estado.toLowerCase()"
          >
            {{ nombreEstadoVerificacion(verificacion.estado) }}
          </span>
        </div>
        <p class="admin-verif__tipo">{{ nombreTipoVerificacion(verificacion.tipo) }}</p>
        <p class="admin-verif__referencia">
          Referencia: <code>{{ verificacion.referencia }}</code>
        </p>
        <p class="admin-verif__fecha">Enviada el {{ fechaYHora(verificacion.solicitadaEn) }}</p>
        <p class="admin-verif__motivo" v-if="verificacion.motivoRechazo">
          Motivo del rechazo: {{ verificacion.motivoRechazo }}
        </p>

        <div class="admin-verif__acciones" v-if="verificacion.estado === 'PENDIENTE'">
          <input
            type="text"
            maxlength="200"
            placeholder="Motivo si la rechazas (opcional)"
            :aria-label="'Motivo del rechazo de ' + verificacion.cuidadorNombre"
            v-model="motivos[verificacion.id]"
          />
          <div class="admin-verif__botones">
            <button
              type="button"
              class="btn btn--primary"
              data-testid="aprobar"
              @click="aprobar(verificacion)"
            >
              Aprobar
            </button>
            <button
              type="button"
              class="btn btn--secondary"
              data-testid="rechazar"
              @click="rechazar(verificacion)"
            >
              Rechazar
            </button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.admin-verif {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-verif__titulo {
  margin: 0;
}

.admin-verif__subtitulo {
  margin: 4px 0 0;
  color: var(--color-text-muted);
}

.admin-verif__filtros {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.admin-verif__filtro {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--color-neutral-bg);
  background-color: var(--color-surface, #fff);
  color: var(--color-text);
  font-family: var(--font-base);
  font-weight: bold;
  cursor: pointer;
}

.admin-verif__filtro--activo {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.admin-verif__vacio {
  color: var(--color-text-muted);
}

.admin-verif__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.admin-verif__tarjeta {
  background-color: var(--color-surface, #fff);
  border: 1px solid var(--color-neutral-bg);
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-verif__tarjeta p {
  margin: 0;
}

.admin-verif__fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.admin-verif__estado {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.admin-verif__estado--verificado {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.admin-verif__estado--rechazado {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.admin-verif__tipo {
  color: var(--color-text-muted);
}

.admin-verif__fecha {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.admin-verif__motivo {
  color: var(--color-accent-dark);
  font-size: 0.9rem;
}

.admin-verif__acciones {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-verif__botones {
  display: flex;
  gap: 8px;
}
</style>
