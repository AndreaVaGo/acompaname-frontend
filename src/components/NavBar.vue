<script setup>
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import CuidadorRepository from "@/repositories/CuidadorRepository";

const authStore = useAuthStore();
const router = useRouter();
const cuidadorRepository = new CuidadorRepository();

function handleLogout() {
  authStore.logout();
  router.push("/login");
}

async function verMiPerfilPublico() {
  try {
    const perfil = await cuidadorRepository.getMiPerfil();
    router.push(`/cuidador/${perfil.id}`);
  } catch (err) {
    console.error("No se pudo cargar tu perfil público", err);
  }
}
</script>

<template>
  <nav class="navbar" v-if="authStore.estaAutenticado">
    <RouterLink to="/" class="navbar__logo">
      <span class="navbar__logo-icon">♥</span>
      <span>Acompáñame</span>
    </RouterLink>

    <div class="navbar__links">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/buscar" v-if="authStore.rol === 'FAMILIA'"
        >Buscar</RouterLink
      >
      <RouterLink v-if="authStore.rol === 'FAMILIA'" to="/solicitudes"
        >Solicitudes</RouterLink
      >
      <RouterLink v-if="authStore.rol === 'CUIDADOR'" to="/solicitudes-cuidador"
        >Solicitudes</RouterLink
      >
      <RouterLink v-if="authStore.rol === 'FAMILIA'" to="/mi-perfil"
        >Perfil</RouterLink
      >
      <button
        v-if="authStore.rol === 'CUIDADOR'"
        class="navbar__link-btn"
        @click="verMiPerfilPublico"
      >
        Ver mi perfil público
      </button>
      <RouterLink to="/historial">Historial</RouterLink>

      <span class="navbar__avatar" :title="authStore.email">
        {{ authStore.email.charAt(0).toUpperCase() }}
      </span>
      <button class="navbar__logout" @click="handleLogout">
        Cerrar sesión
      </button>
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

.navbar__link-btn {
  background: none;
  border: none;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
}

.navbar__avatar {
  background-color: var(--color-accent-bg);
  color: var(--color-accent);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: default;
}

.navbar__logout {
  background-color: var(--color-accent);
  border: 1px solid var(--color-accent);
  color: var(--color-white);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
}

.navbar__logout:hover {
  opacity: 0.9;
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
