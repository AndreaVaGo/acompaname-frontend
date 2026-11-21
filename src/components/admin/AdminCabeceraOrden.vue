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

/* La flecha se dibuja con CSS: ⇅ si no está ordenada, ▲ de menor a mayor y ▼ al revés.
   Va en una cajita redonda del color de la sección para que se vea bien */
.admin-cabecera-orden__boton::after {
  content: "⇅";
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: color-mix(in srgb, var(--admin-color, var(--color-accent)) 18%, white);
  color: var(--admin-color, var(--color-accent));
  font-size: 0.95rem;
  font-weight: bold;
  line-height: 1;
}

.admin-cabecera-orden__boton[data-direccion="asc"]::after {
  content: "▲";
  background-color: var(--admin-color, var(--color-accent));
  color: var(--color-white);
  font-size: 0.7rem;
}

.admin-cabecera-orden__boton[data-direccion="desc"]::after {
  content: "▼";
  background-color: var(--admin-color, var(--color-accent));
  color: var(--color-white);
  font-size: 0.7rem;
}

.admin-cabecera-orden__boton:hover::after {
  background-color: color-mix(in srgb, var(--admin-color, var(--color-accent)) 35%, white);
}

.admin-cabecera-orden__boton[data-direccion]:not([data-direccion=""]):hover::after {
  background-color: var(--admin-color, var(--color-accent));
}

.admin-cabecera-orden__boton--activo {
  color: var(--color-accent-dark);
}
</style>
