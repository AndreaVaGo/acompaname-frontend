<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import UsuarioRepository from "@/repositories/UsuarioRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";

const authStore = useAuthStore();
const router = useRouter();
const usuarioRepository = new UsuarioRepository();

const usuario = ref(null);
const cargando = ref(true);
const error = ref("");

// La inicial del nombre, para el círculo de arriba
const inicial = computed(() => {
  if (!usuario.value || !usuario.value.nombre) {
    return "";
  }
  return usuario.value.nombre.charAt(0).toUpperCase();
});

onMounted(async () => {
  try {
    usuario.value = await usuarioRepository.getById(authStore.id);
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudieron cargar tus datos.");
  } finally {
    cargando.value = false;
  }
});

function cerrarSesion() {
  authStore.logout();
  router.push("/");
}
</script>

<template>
  <div class="mi-perfil" v-if="usuario">
    <h1>Mi perfil</h1>
    <p class="mi-perfil__subtitle">Tus datos de contacto.</p>

    <div class="mi-perfil__box">
      <div class="mi-perfil__cabecera">
        <span class="mi-perfil__avatar">{{ inicial }}</span>
        <h2>{{ usuario.nombre }}</h2>
        <span class="mi-perfil__tipo">{{ usuario.roles.join(", ") }}</span>
      </div>

      <div class="mi-perfil__datos">
        <div class="mi-perfil__fila">
          <span>✉️ Email</span>
          <strong>{{ usuario.email }}</strong>
        </div>
        <div class="mi-perfil__fila">
          <span>📞 Teléfono</span>
          <strong>{{ usuario.telefono }}</strong>
        </div>
      </div>

      <div class="mi-perfil__acciones">
        <button class="btn btn--secondary" @click="cerrarSesion">
          Cerrar sesión
        </button>
      </div>
    </div>
  </div>
  <p v-else-if="error">{{ error }}</p>
  <p v-else>Cargando...</p>
</template>

<style scoped>
.mi-perfil {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 20px;
  /* width: 100% hace falta porque, con margin auto, la caja se encoge al contenido */
  width: 100%;
  max-width: 680px;
  margin: 0 auto;

  & h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }
}

.mi-perfil__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.mi-perfil__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Franja de color con la inicial, el nombre y el tipo de cuenta */
.mi-perfil__cabecera {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 24px;
  background-color: var(--color-accent-bg);

  & h2 {
    margin: 0;
    font-size: 1.6rem;
  }
}

.mi-perfil__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-color: var(--color-accent);
  color: var(--color-white);
  font-size: 2.4rem;
  font-weight: bold;
}

.mi-perfil__tipo {
  background-color: var(--color-white);
  color: var(--color-accent-dark);
  padding: 4px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: bold;
}

.mi-perfil__datos {
  padding: 12px 32px;
}

.mi-perfil__fila {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-neutral-bg);
  font-size: 1rem;

  & span {
    color: var(--color-text-muted);
  }

  & strong {
    overflow-wrap: anywhere;
    text-align: right;
  }
}

.mi-perfil__fila:last-child {
  border-bottom: none;
}

.mi-perfil__acciones {
  padding: 8px 32px 32px;

  & .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .mi-perfil {
    padding: 24px 20px;
  }

  .mi-perfil__datos {
    padding: 8px 20px;
  }

  .mi-perfil__acciones {
    padding: 8px 20px 24px;
  }

  .mi-perfil__fila {
    flex-direction: column;
    gap: 4px;
  }

  .mi-perfil__fila strong {
    text-align: left;
  }
}
</style>