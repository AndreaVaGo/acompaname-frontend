<script setup>
// Vista provisional: en la tarea del dashboard (ACOM-147) se sustituye por el panel completo
</script>

<template>
  <div class="admin">
    <h1>Panel de administración</h1>
    <p class="admin__texto">Aquí aparecerán las estadísticas y la gestión de la plataforma.</p>
  </div>
</template>

<style scoped>
.admin {
  max-width: 1152px;
  margin: 0 auto;
  padding: 24px 20px 32px;
  font-family: var(--font-base);
  color: var(--color-text);
}

.admin h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.admin__texto {
  color: var(--color-text-muted);
  margin: 0;
}
</style>