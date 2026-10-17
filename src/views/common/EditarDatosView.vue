<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import UsuarioRepository from "@/repositories/UsuarioRepository";
import { useAuthStore } from "@/stores/auth";

const nombre = ref("");
const email = ref("");
const telefono = ref("");
const cargando = ref(true);
const error = ref("");
const exito = ref("");

const usuarioRepository = new UsuarioRepository();
const authStore = useAuthStore();

// La inicial del nombre, para el círculo de arriba
const inicial = computed(() => {
  if (!nombre.value) {
    return "";
  }
  return nombre.value.charAt(0).toUpperCase();
});

onMounted(async () => {
  try {
    const usuario = await usuarioRepository.getById(authStore.id);
    nombre.value = usuario.nombre;
    email.value = usuario.email;
    telefono.value = usuario.telefono;
  } catch (err) {
    error.value = "No se pudieron cargar tus datos.";
  } finally {
    cargando.value = false;
  }
});

async function handleSubmit() {
  exito.value = "";

  if (!nombre.value.trim() || !email.value.trim() || !telefono.value.trim()) {
    error.value = "Por favor, rellena todos los campos.";
    return;
  }
  if (!email.value.includes("@")) {
    error.value = "El email no tiene un formato válido.";
    return;
  }
  error.value = "";

  try {
    const usuario = await usuarioRepository.actualizarContacto(
      authStore.id,
      nombre.value.trim(),
      email.value.trim(),
      telefono.value.trim(),
    );
    // Si ha cambiado el email, hay que actualizar la sesión
    if (usuario.email !== authStore.email) {
      authStore.actualizarEmail(usuario.email);
    }
    exito.value = "Datos actualizados correctamente.";
  } catch (err) {
    error.value =
      "No se pudieron guardar los datos. Puede que ese email ya esté en uso.";
  }
}
</script>

<template>
  <div class="editar-datos">
    <div class="editar-datos__wrapper">
      <h1>Editar mis datos</h1>
      <p class="editar-datos__subtitle">
        Cambia tu nombre, tu email o tu teléfono.
      </p>

      <div class="editar-datos__box">
        <p v-if="cargando" class="editar-datos__cargando">Cargando...</p>

        <template v-else>
          <div class="editar-datos__cabecera">
            <span class="editar-datos__avatar">{{ inicial }}</span>
            <span class="editar-datos__nombre">{{ nombre }}</span>
          </div>

          <form class="editar-datos__form" @submit.prevent="handleSubmit">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombre" v-model="nombre" />

            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" />

            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" v-model="telefono" />

            <p v-if="error" class="editar-datos__error">{{ error }}</p>
            <p v-if="exito" class="editar-datos__exito">{{ exito }}</p>

            <button type="submit" class="btn btn--primary">
              Guardar cambios
            </button>
          </form>
        </template>

        <RouterLink to="/cambiar-password" class="editar-datos__enlace">
          Cambiar contraseña
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editar-datos {
  background-color: var(--color-bg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 24px 20px 32px;
}

.editar-datos__wrapper {
  max-width: 560px;
  width: 100%;
}

.editar-datos h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.editar-datos__subtitle {
  color: var(--color-text-muted);
  margin: 0 0 24px;
}

.editar-datos__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.editar-datos__cargando {
  padding: 24px;
}

/* Franja de color con la inicial y el nombre */
.editar-datos__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background-color: var(--color-accent-bg);
}

.editar-datos__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-accent);
  color: var(--color-white);
  font-size: 1.8rem;
  font-weight: bold;
}

.editar-datos__nombre {
  font-size: 1.3rem;
  font-weight: bold;
  overflow-wrap: anywhere;
}

.editar-datos__form {
  display: flex;
  flex-direction: column;
  padding: 28px 32px 8px;

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  & input {
    padding: 12px 16px;
    border-radius: var(--radius-input);
    border: 1px solid var(--color-border);
    margin-bottom: 18px;
    font-size: 1rem;
    font-family: inherit;
  }

  & input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-bg);
  }

  & .btn {
    padding: 14px;
  }
}

.editar-datos__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.editar-datos__exito {
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.editar-datos__enlace {
  display: block;
  margin: 12px 32px 0;
  padding: 18px 0 24px;
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-accent-dark);
  font-weight: 600;
  text-decoration: none;
}

@media (hover: hover) {
  .editar-datos__enlace:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .editar-datos {
    padding: 16px 16px 24px;
  }

  .editar-datos__cabecera {
    padding: 20px;
  }

  .editar-datos__form {
    padding: 24px 20px 8px;
  }

  .editar-datos__enlace {
    margin: 12px 20px 0;
  }
}
</style>