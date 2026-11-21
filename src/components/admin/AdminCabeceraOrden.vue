<script setup>
import { computed } from "vue";

// Cabecera de columna con dos flechitas para ordenar la tabla:
// ▲ ordena de menor a mayor (de la A a la Z) y ▼ al revés. Un clic y listo.
// - etiqueta: el texto de la columna
// - clave: cómo se llama esta columna en el orden (por ejemplo "fecha")
// - orden: { clave, direccion } con el orden actual de la tabla
// Al pulsar una flecha avisa con "ordenar" y el nuevo orden { clave, direccion }.
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

// Una flecha está encendida si la tabla está ordenada por esta columna y en ese sentido
function encendida(direccion) {
  return activa.value && props.orden.direccion === direccion;
}

function ordenar(direccion) {
  emit("ordenar", { clave: props.clave, direccion: direccion });
}
</script>

<template>
  <th class="admin-cabecera-orden" :aria-sort="ariaSort">
    <span class="admin-cabecera-orden__contenido">
      <span class="admin-cabecera-orden__texto">{{ etiqueta }}</span>
      <span class="admin-cabecera-orden__flechas">
        <button
          type="button"
          class="admin-cabecera-orden__flecha"
          :class="{ 'admin-cabecera-orden__flecha--activa': encendida('asc') }"
          data-direccion="asc"
          :aria-label="`Ordenar ${etiqueta} de menor a mayor`"
          :aria-pressed="encendida('asc')"
          @click="ordenar('asc')"
        >
          ▲
        </button>
        <button
          type="button"
          class="admin-cabecera-orden__flecha"
          :class="{ 'admin-cabecera-orden__flecha--activa': encendida('desc') }"
          data-direccion="desc"
          :aria-label="`Ordenar ${etiqueta} de mayor a menor`"
          :aria-pressed="encendida('desc')"
          @click="ordenar('desc')"
        >
          ▼
        </button>
      </span>
    </span>
  </th>
</template>

<style scoped>
.admin-cabecera-orden__contenido {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.admin-cabecera-orden__flechas {
  display: inline-flex;
  gap: 3px;
}

/* Cada flecha es una cajita redonda del color de la sección:
   apagada (tono suave) y encendida (color pleno con la flecha blanca) */
.admin-cabecera-orden__flecha {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: color-mix(in srgb, var(--admin-color, var(--color-accent)) 18%, white);
  color: var(--admin-color, var(--color-accent));
  font-size: 0.7rem;
  line-height: 1;
  cursor: pointer;
}

.admin-cabecera-orden__flecha:hover {
  background-color: color-mix(in srgb, var(--admin-color, var(--color-accent)) 40%, white);
}

.admin-cabecera-orden__flecha--activa,
.admin-cabecera-orden__flecha--activa:hover {
  background-color: var(--admin-color, var(--color-accent));
  color: var(--color-white);
}
</style>
