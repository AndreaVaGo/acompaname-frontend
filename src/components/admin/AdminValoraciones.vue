<script setup>
import { ref } from "vue";
import { formatearFecha } from "@/utils/formatearFecha";

// Tarjeta «Últimas valoraciones». Eliminar pide confirmación antes de avisar a la vista.
defineProps({
  valoraciones: { type: Array, required: true },
});

const emit = defineEmits(["eliminar"]);

// Id de la valoración que está esperando confirmación (null si ninguna)
const idEnConfirmacion = ref(null);

function pedirConfirmacion(id) {
  idEnConfirmacion.value = id;
}

function cancelar() {
  idEnConfirmacion.value = null;
}

function confirmar(id) {
  idEnConfirmacion.value = null;
  emit("eliminar", id);
}
</script>

<template>
  <div class="admin-valoraciones">
    <h2 class="titulo-seccion">Últimas valoraciones</h2>

    <p v-if="valoraciones.length === 0" class="admin-valoraciones__vacio">
      Todavía no hay valoraciones.
    </p>

    <div v-else class="admin-valoraciones__lista">
      <div
        v-for="valoracion in valoraciones"
        :key="valoracion.id"
        class="admin-valoraciones__fila"
      >
        <div class="admin-valoraciones__datos">
          <div class="admin-valoraciones__comentario">
            {{ valoracion.comentario || "Sin comentario" }}
          </div>
          <div class="admin-valoraciones__detalle">
            {{ valoracion.puntuacion }} / 5 · {{ valoracion.nombreFamilia }} sobre
            {{ valoracion.nombreCuidador }} · {{ formatearFecha(valoracion.fecha) }}
          </div>
        </div>

        <div
          v-if="idEnConfirmacion === valoracion.id"
          class="admin-valoraciones__confirmacion"
        >
          <span class="admin-valoraciones__pregunta">¿Eliminar esta valoración?</span>
          <button
            type="button"
            class="btn admin-valoraciones__si"
            @click="confirmar(valoracion.id)"
          >
            Sí, eliminar
          </button>
          <button type="button" class="btn btn--secondary" @click="cancelar">
            Cancelar
          </button>
        </div>

        <button
          v-else
          type="button"
          class="btn admin-valoraciones__eliminar"
          @click="pedirConfirmacion(valoracion.id)"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-valoraciones {
  flex: 1 1 420px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-valoraciones .titulo-seccion {
  margin-top: 0;
}

.admin-valoraciones__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-valoraciones__lista {
  display: flex;
  flex-direction: column;
}

.admin-valoraciones__fila {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-neutral-bg);
}

.admin-valoraciones__fila:last-child {
  border-bottom: none;
}

.admin-valoraciones__datos {
  flex: 1 1 220px;
  min-width: 0;
}

.admin-valoraciones__comentario {
  font-size: 0.9rem;
}

.admin-valoraciones__detalle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.admin-valoraciones__confirmacion {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.admin-valoraciones__pregunta {
  font-size: 0.85rem;
  font-weight: bold;
}

/* Botones más pequeños que los de las páginas, para que quepan en la fila */
.admin-valoraciones .btn {
  padding: 8px 16px;
  font-size: 0.85rem;
}

.admin-valoraciones__eliminar,
.admin-valoraciones__si {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
}
</style>