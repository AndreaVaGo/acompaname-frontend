<script setup>
import { ref, onMounted } from "vue";
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
        <p v-if="cargando">Cargando...</p>

        <form v-else class="editar-datos__form" @submit.prevent="handleSubmit">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" v-model="nombre" />

          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" />

          <label for="telefono">Teléfono</label>
          <input type="tel" id="telefono" v-model="telefono" />

          <p v-if="error" class="editar-datos__error">{{ error }}</p>
          <p v-if="exito" class="editar-datos__exito">{{ exito }}</p>

          <button type="submit" class="btn btn--primary">Guardar cambios</button>
        </form>

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
  max-width: 420px;
  width: 100%;
}

.editar-datos h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.editar-datos__subtitle {
  color: var(--color-text-muted);
  margin: 0 0 20px;
}

.editar-datos__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.editar-datos__form {
  display: flex;
  flex-direction: column;

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  & input {
    padding: 10px 14px;
    border-radius: var(--radius-input);
    border: 1px solid var(--color-border);
    margin-bottom: 14px;
    font-size: 1rem;
    font-family: inherit;
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
  margin-top: 16px;
  text-align: center;
  color: var(--color-accent);
  font-weight: 600;
  text-decoration: none;
}

@media (max-width: 480px) {
  .editar-datos {
    padding: 16px 16px 24px;
  }

  .editar-datos__box {
    padding: 18px;
  }
}
</style>