<script setup>
// Desplegable "Ordenar por" para el móvil, donde las tablas no tienen cabecera con flechas.
// - columnas: lista de { clave, nombre } por las que se puede ordenar
// - orden: { clave, direccion } con el orden actual
// Avisa con "ordenar" y el nuevo orden { clave, direccion }: al elegir una columna
// (mantiene el sentido actual) o al pulsar uno de los dos botones de sentido.
const props = defineProps({
  columnas: { type: Array, required: true },
  orden: { type: Object, required: true },
});

const emit = defineEmits(["ordenar"]);

function elegirColumna(evento) {
  emit("ordenar", { clave: evento.target.value, direccion: props.orden.direccion });
}

function elegirSentido(direccion) {
  emit("ordenar", { clave: props.orden.clave, direccion: direccion });
}
</script>

<template>
  <div class="admin-ordenar">
    <label class="admin-ordenar__etiqueta">
      Ordenar por
      <select class="admin-ordenar__select" :value="orden.clave" @change="elegirColumna">
        <option value="">Sin ordenar</option>
        <option v-for="columna in props.columnas" :key="columna.clave" :value="columna.clave">
          {{ columna.nombre }}
        </option>
      </select>
    </label>

    <div v-if="orden.clave !== ''" class="admin-ordenar__sentidos">
      <button
        type="button"
        class="admin-ordenar__sentido"
        :class="{ 'admin-ordenar__sentido--activo': orden.direccion === 'asc' }"
        data-direccion="asc"
        :aria-pressed="orden.direccion === 'asc'"
        @click="elegirSentido('asc')"
      >
        ▲ De menor a mayor
      </button>
      <button
        type="button"
        class="admin-ordenar__sentido"
        :class="{ 'admin-ordenar__sentido--activo': orden.direccion === 'desc' }"
        data-direccion="desc"
        :aria-pressed="orden.direccion === 'desc'"
        @click="elegirSentido('desc')"
      >
        ▼ De mayor a menor
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Solo se ve en el móvil: en pantallas grandes se ordena con las flechas de las cabeceras */
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

.admin-ordenar__sentidos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

/* El sentido elegido se ve relleno con el color de la sección */
.admin-ordenar__sentido--activo {
  background-color: var(--admin-color, var(--color-accent));
  border-color: var(--admin-color, var(--color-accent));
  color: var(--color-white);
}
</style>
