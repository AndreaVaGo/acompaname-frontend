<script setup>
import { ref, computed } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import CuidadorRepository from "@/repositories/CuidadorRepository";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const cuidadorRepository = new CuidadorRepository();

const menuAbierto = ref(false);

const esPantallaAcceso = computed(
  () => route.path === "/login" || route.path === "/registro",
);

const inicial = computed(() =>
  authStore.email ? authStore.email.charAt(0).toUpperCase() : "?",
);

const tipoCuenta = computed(() =>
  authStore.rol === "FAMILIA" ? "Cuenta de familia" : "Cuenta de cuidador",
);

function handleLogout() {
  menuAbierto.value = false;
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

function irAEditarPerfil() {
  menuAbierto.value = false;
  router.push("/editar-perfil");
}

function irAMiPerfil() {
  menuAbierto.value = false;
  if (authStore.rol === "FAMILIA") {
    router.push("/mi-perfil");
  } else {
    verMiPerfilPublico();
  }
}
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="navbar__logo">
      <span class="navbar__logo-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          />
          <path
            d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"
          />
          <path d="m18 15-2-2" />
          <path d="m15 18-2-2" />
        </svg>
      </span>
      <span>Acompáñame</span>
    </RouterLink>

    <div class="navbar__links" v-if="authStore.estaAutenticado">
      <RouterLink to="/" class="navbar__link">Inicio</RouterLink>
      <RouterLink
        v-if="authStore.rol === 'FAMILIA'"
        to="/buscar"
        class="navbar__link"
        >Buscar</RouterLink
      >
      <RouterLink
        v-if="authStore.rol === 'FAMILIA'"
        to="/solicitudes"
        class="navbar__link"
        >Solicitudes</RouterLink
      >
      <RouterLink
        v-if="authStore.rol === 'CUIDADOR'"
        to="/solicitudes-cuidador"
        class="navbar__link"
        >Solicitudes</RouterLink
      >
      <RouterLink to="/historial" class="navbar__link">Historial</RouterLink>

      <div class="navbar__account">
        <button
          type="button"
          class="navbar__avatar"
          aria-label="Abrir menú de mi cuenta"
          :title="authStore.email"
          @click="menuAbierto = !menuAbierto"
        >
          {{ inicial }}
        </button>

        <template v-if="menuAbierto">
          <div class="navbar__overlay" @click="menuAbierto = false"></div>
          <div class="navbar__menu">
            <div class="navbar__menu-header">
              {{ authStore.email }}
              <span class="navbar__menu-role">{{ tipoCuenta }}</span>
            </div>
            <button
              type="button"
              class="navbar__menu-item"
              @click="irAMiPerfil"
            >
              Mi perfil
            </button>
            <button
              v-if="authStore.rol === 'CUIDADOR'"
              type="button"
              class="navbar__menu-item"
              @click="irAEditarPerfil"
            >
              Editar mi perfil
            </button>
            <button
              type="button"
              class="navbar__menu-item"
              @click="handleLogout"
            >
              Cerrar sesión
            </button>
          </div>
        </template>
      </div>
    </div>

    <div class="navbar__links" v-else-if="!esPantallaAcceso">
      <RouterLink to="/login" class="navbar__link">Iniciar sesión</RouterLink>
      <RouterLink to="/registro" class="navbar__cta">Registrarme</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 24px;
  max-width: 1152px;
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
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.navbar__link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
}

.navbar__link:hover {
  background-color: var(--color-neutral-bg);
  color: var(--color-text);
}

.navbar__link.router-link-exact-active {
  background-color: var(--color-secondary-bg);
  color: var(--color-text);
}

.navbar__cta {
  background-color: var(--color-accent);
  color: var(--color-white);
  text-decoration: none;
  font-size: 0.95rem;
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  margin-left: 6px;
}

.navbar__account {
  position: relative;
  margin-left: 10px;
}

.navbar__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background-color: var(--color-secondary-bg);
  color: var(--color-text);
  font-weight: bold;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
}

.navbar__avatar:hover {
  background-color: var(--color-neutral-bg);
}

.navbar__overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
}

.navbar__menu {
  position: absolute;
  right: 0;
  top: 54px;
  z-index: 20;
  min-width: 230px;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 8px;
}

.navbar__menu-header {
  display: block;
  padding: 8px 12px;
  font-weight: bold;
  font-size: 0.95rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 6px;
  word-break: break-all;
}

.navbar__menu-role {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.navbar__menu-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 12px;
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-text);
  cursor: pointer;
}

.navbar__menu-item:hover {
  background-color: var(--color-neutral-bg);
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
  }
}
</style>