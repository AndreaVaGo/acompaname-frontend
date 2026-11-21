<script setup>
// Desplegable "Ordenar por" para el móvil, donde las tablas no tienen cabecera que pulsar.
// - columnas: lista de { clave, nombre } por las que se puede ordenar
// - orden: { clave, direccion } con el orden actual
// Avisa con "ordenar" y la clave: al elegir una columna, o al pulsar el botón de sentido
// (que repite la clave actual y por eso da la vuelta al orden).
const props = defineProps({
  columnas: { type: Array, required: true },
  orden: { type: Object, required: true },
});

const emit = defineEmits(["ordenar"]);
</script>

<template>
  <div class="admin-ordenar">
    <label class="admin-ordenar__etiqueta">
      Ordenar por
      <select
        class="admin-ordenar__select"
        :value="orden.clave"
        @change="emit('ordenar', $event.target.value)"
      >
        <option value="">Sin ordenar</option>
        <option v-for="columna in props.columnas" :key="columna.clave" :value="columna.clave">
          {{ columna.nombre }}
        </option>
      </select>
    </label>

    <button
      v-if="orden.clave !== ''"
      type="button"
      class="admin-ordenar__sentido"
      @click="emit('ordenar', orden.clave)"
    >
      {{ orden.direccion === "asc" ? "▲ De menor a mayor" : "▼ De mayor a menor" }}
    </button>
  </div>
</template>

<style scoped>
/* Solo se ve en el móvil: en pantallas grandes se ordena pulsando las cabeceras */
.admin-ordenar {
  display: none;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

@media (max-width: 640px) {
  .admin-ordenar {
    display: flex;
  }
}

.admin-ordenar__etiqueta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: bold;
}

.admin-ordenar__select,
.admin-ordenar__sentido {
  padding: 8px 12px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  background-color: rgba(255, 255, 255, 0.85);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
}

.admin-ordenar__sentido {
  cursor: pointer;
  font-weight: bold;
}
</style>
