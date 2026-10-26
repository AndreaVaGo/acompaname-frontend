<script setup>
// Menú del panel de administración: un botón por sección.
// No cambia nada por sí mismo, solo avisa de la sección que se elige.
defineProps({
  // Lista de secciones: [{ id: "resumen", texto: "Resumen" }, ...]
  secciones: { type: Array, required: true },
  // Id de la sección que se está viendo
  activa: { type: String, required: true },
});

defineEmits(["cambiar"]);
</script>

<template>
  <nav class="admin-menu" aria-label="Secciones del panel">
    <button
      v-for="seccion in secciones"
      :key="seccion.id"
      type="button"
      class="admin-menu__boton"
      :class="{ 'admin-menu__boton--activo': seccion.id === activa }"
      :aria-current="seccion.id === activa ? 'page' : undefined"
      @click="$emit('cambiar', seccion.id)"
    >
      {{ seccion.texto }}
    </button>
  </nav>
</template>

<style scoped>
.admin-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 12px;
  font-family: var(--font-base);
}

.admin-menu__boton {
  background: none;
  border: none;
  border-radius: var(--radius-input);
  padding: 12px 14px;
  text-align: left;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: bold;
  color: var(--color-text-muted);
  cursor: pointer;
}

.admin-menu__boton:hover {
  background-color: var(--color-neutral-bg);
  color: var(--color-text);
}

.admin-menu__boton--activo,
.admin-menu__boton--activo:hover {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

/* En móvil el menú pasa a ser una fila de pestañas con scroll horizontal */
@media (max-width: 768px) {
  .admin-menu {
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;
  }

  .admin-menu__boton {
    white-space: nowrap;
  }
}
</style>