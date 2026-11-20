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
  <div class="mi-perfil pantalla" v-if="usuario">
    <h1>Mi perfil</h1>
    <p class="mi-perfil__subtitle">Tus datos de contacto.</p>

    <div class="mi-perfil__box tarjeta-cristal">
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

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.mi-perfil__box {
  --borde-tarjeta: var(--color-accent);
  overflow: hidden;
}

/* Franja de color con la inicial, el nombre y el tipo de cuenta */
.mi-perfil__cabecera {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 24px;
  /* Franja con las manchas coral y verde de la marca */
  background:
    radial-gradient(circle at 15% 20%, rgba(242, 137, 107, 0.35), transparent 55%),
    radial-gradient(circle at 85% 80%, rgba(46, 125, 91, 0.28), transparent 55%),
    var(--color-accent-bg);

  & h2 {
    margin: 0;
    font-size: 1.6rem;
  }
}

/* Círculo con la inicial: degradado, aro blanco y una entrada con "rebote" */
.mi-perfil__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-dark));
  color: var(--color-white);
  font-size: 2.6rem;
  font-weight: bold;
  box-shadow:
    0 0 0 6px rgba(255, 255, 255, 0.7),
    var(--shadow-card);
  animation: avatar-entra 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s backwards;
}

@keyframes avatar-entra {
  from {
    opacity: 0;
    scale: 0.4;
  }
}

.mi-perfil__tipo {
  background-color: var(--color-white);
  color: var(--color-secondary);
  border: 1px solid var(--color-secondary);
  padding: 4px 16px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mi-perfil__datos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 28px 8px;
}

/* Cada dato va en su propia pastilla, que se resalta al pasar el ratón */
.mi-perfil__fila {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background-color: var(--color-neutral-bg);
  border-left: 4px solid var(--color-accent);
  border-radius: var(--radius-input);
  font-size: 1rem;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);

  & span {
    color: var(--color-text-muted);
  }

  & strong {
    overflow-wrap: anywhere;
    text-align: right;
  }
}

.mi-perfil__fila:nth-child(even) {
  border-left-color: var(--color-secondary);
}

@media (hover: hover) {
  .mi-perfil__fila:hover {
    background-color: var(--color-accent-bg);
    transform: translateX(4px);
  }
}

.mi-perfil__acciones {
  padding: 16px 28px 28px;

  & .btn {
    width: 100%;
  }
}

/* Cerrar sesión: borde coral que se rellena al pasar el ratón (el icono va puesto con CSS) */
.mi-perfil__acciones .btn--secondary {
  background-color: var(--color-white);
  border: 2px solid var(--color-accent);
  color: var(--color-accent-dark);
  font-weight: bold;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.mi-perfil__acciones .btn--secondary::before {
  content: "🚪 ";
}

.mi-perfil__acciones .btn--secondary:hover {
  background-color: var(--color-accent);
  color: var(--color-white);
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