<script setup>
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <nav class="navbar" v-if="authStore.rolActual">
    <RouterLink to="/" class="navbar__logo">
      <span class="navbar__logo-icon">♥</span>
      <span>Acompáñame</span>
    </RouterLink>

    <div class="navbar__links">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/buscar" v-if="authStore.rolActual === 'familia'"
        >Buscar</RouterLink
      >
      <RouterLink v-if="authStore.rolActual === 'familia'" to="/solicitudes"
        >Solicitudes</RouterLink
      >
      <RouterLink
        v-if="authStore.rolActual === 'cuidador'"
        to="/solicitudes-cuidador"
        >Solicitudes</RouterLink
      >
      <RouterLink v-if="authStore.rolActual === 'familia'" to="/mi-perfil"
        >Perfil</RouterLink
      >
      <RouterLink v-if="authStore.rolActual === 'cuidador'" to="/editar-perfil"
        >Perfil</RouterLink
      >
      <RouterLink to="/historial">Historial</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 60px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: var(--font-base);
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  text-decoration: none;
  color: var(--color-text);
}

.navbar__logo-icon {
  background-color: var(--color-accent-bg);
  border-radius: 50%;
  padding: 8px 10px;
  color: var(--color-accent);
  font-size: 0.9rem;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: var(--gap-md);

  & a {
    color: var(--color-text);
    text-decoration: none;
    font-size: 0.95rem;
  }

  & a.router-link-active {
    color: var(--color-accent);
    font-weight: bold;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
  }

  .navbar__links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
}
</style>