<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="no-encontrado">
    <span class="no-encontrado__icono" aria-hidden="true">🧭</span>
    <p class="no-encontrado__codigo">404</p>
    <h1>No encontramos esta página</h1>
    <p>
      Puede que la dirección esté mal escrita o que la página ya no exista. No
      pasa nada: te ayudamos a volver.
    </p>
    <div class="no-encontrado__acciones">
      <RouterLink to="/" class="btn btn--primary">Volver al inicio</RouterLink>
      <RouterLink to="/buscar" class="btn btn--secondary">
        Ver personas cuidadoras
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.no-encontrado {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: var(--gap-lg) 24px;
  font-family: var(--font-base);
  color: var(--color-text);

  & p {
    max-width: 460px;
    color: var(--color-text-muted);
    margin: 0;
  }
}

.no-encontrado__icono {
  font-size: 3rem;
}

.no-encontrado__codigo {
  font-size: 4rem;
  font-weight: bold;
  line-height: 1;
  color: var(--color-accent-dark) !important;
}

.no-encontrado h1 {
  font-size: 1.8rem;
  margin: 4px 0;
}

.no-encontrado__acciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;

  & .btn {
    text-decoration: none;
  }
}
</style>
