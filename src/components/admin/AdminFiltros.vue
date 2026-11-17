<script setup>
// Fila de botones para filtrar (por estado o por rol) del panel de administración.
// Cada opción es { valor, nombre, color } y, si quiere contador, también { cuenta }.
// color puede ser: neutro, naranja, verde, azul o gris (los mismos colores que las píldoras).
// elegido es el valor que está marcado ("" = Todos). Al pulsar un botón avisa con "elegir".
defineProps({
  opciones: { type: Array, required: true },
  elegido: { type: String, default: "" },
  etiqueta: { type: String, required: true },
});

const emit = defineEmits(["elegir"]);
</script>

<template>
  <div class="admin-filtros" role="group" :aria-label="etiqueta">
    <button
      v-for="opcion in opciones"
      :key="opcion.valor"
      type="button"
      class="admin-filtros__boton"
      :class="[
        'admin-filtros__boton--' + opcion.color,
        { 'admin-filtros__boton--activo': elegido === opcion.valor },
      ]"
      :aria-pressed="elegido === opcion.valor"
      @click="emit('elegir', opcion.valor)"
    >
      {{ opcion.nombre }}
      <span v-if="opcion.cuenta !== undefined" class="admin-filtros__cuenta">{{ opcion.cuenta }}</span>
    </button>
  </div>
</template>

<style scoped>
.admin-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

/* Cada color define cuatro variables y el botón las usa */
.admin-filtros__boton {
  --letra: var(--color-text);
  --fondo: var(--color-neutral-bg);
  --borde: var(--color-text-muted);
  --cuenta-activa: var(--color-text-muted);

  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  color: var(--letra);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
}

.admin-filtros__boton:hover,
.admin-filtros__boton--activo {
  background-color: var(--fondo);
  border-color: var(--borde);
}

.admin-filtros__cuenta {
  min-width: 24px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background-color: var(--fondo);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  text-align: center;
}

.admin-filtros__boton--activo .admin-filtros__cuenta {
  background-color: var(--cuenta-activa);
  color: var(--color-white);
}

/* Gris: solo cambia la letra (el resto es igual que neutro, que es el color por defecto) */
.admin-filtros__boton--gris {
  --letra: var(--color-text-muted);
}

.admin-filtros__boton--naranja {
  --letra: var(--color-accent-dark);
  --fondo: var(--color-accent-bg);
  --borde: var(--color-accent-dark);
  --cuenta-activa: var(--color-accent-dark);
}

.admin-filtros__boton--verde {
  --letra: var(--color-secondary);
  --fondo: var(--color-secondary-bg);
  --borde: var(--color-secondary);
  --cuenta-activa: var(--color-secondary);
}

.admin-filtros__boton--azul {
  --letra: var(--color-info);
  --fondo: var(--color-info-bg);
  --borde: var(--color-info);
  --cuenta-activa: var(--color-info);
}

/* En los colores el contador no activo lleva el fondo del color */
.admin-filtros__boton--naranja .admin-filtros__cuenta,
.admin-filtros__boton--verde .admin-filtros__cuenta,
.admin-filtros__boton--azul .admin-filtros__cuenta {
  color: inherit;
}
</style>
