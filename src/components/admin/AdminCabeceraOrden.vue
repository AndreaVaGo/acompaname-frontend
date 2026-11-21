<script setup>
import { computed } from "vue";

// Cabecera de columna que se puede pulsar para ordenar la tabla.
// - etiqueta: el texto de la columna
// - clave: cómo se llama esta columna en el orden (por ejemplo "fecha")
// - orden: { clave, direccion } con el orden actual de la tabla
// Al pulsarla avisa con "ordenar" y la clave; quien la usa decide el nuevo orden.
const props = defineProps({
  etiqueta: { type: String, required: true },
  clave: { type: String, required: true },
  orden: { type: Object, required: true },
});

const emit = defineEmits(["ordenar"]);

const activa = computed(() => props.orden.clave === props.clave);

// Para los lectores de pantalla: ascending, descending o none
const ariaSort = computed(() => {
  if (!activa.value) {
    return "none";
  }
  return props.orden.direccion === "asc" ? "ascending" : "descending";
});
</script>

<template>
  <th class="admin-cabecera-orden" :aria-sort="ariaSort">
    <button
      type="button"
      class="admin-cabecera-orden__boton"
      :class="{ 'admin-cabecera-orden__boton--activo': activa }"
      :data-direccion="activa ? orden.direccion : ''"
      @click="emit('ordenar', clave)"
    >
      {{ etiqueta }}
    </button>
  </th>
</template>

<style scoped>
.admin-cabecera-orden__boton {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: bold;
  cursor: pointer;
}

/* La flecha se dibuja con CSS: ↕ si no está ordenada, ▲ de menor a mayor y ▼ al revés */
.admin-cabecera-orden__boton::after {
  content: "↕";
  font-size: 0.8rem;
  opacity: 0.4;
}

.admin-cabecera-orden__boton[data-direccion="asc"]::after {
  content: "▲";
  opacity: 1;
}

.admin-cabecera-orden__boton[data-direccion="desc"]::after {
  content: "▼";
  opacity: 1;
}

.admin-cabecera-orden__boton:hover::after {
  opacity: 1;
}

.admin-cabecera-orden__boton--activo {
  color: var(--color-accent-dark);
}
</style>
