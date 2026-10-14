<script setup>
import { ref } from "vue";
import UsuarioRepository from "@/repositories/UsuarioRepository";
import { useAuthStore } from "@/stores/auth";

const passwordActual = ref("");
const passwordNueva = ref("");
const passwordRepetida = ref("");
const error = ref("");
const exito = ref("");

const usuarioRepository = new UsuarioRepository();
const authStore = useAuthStore();

async function handleSubmit() {
  exito.value = "";

  if (!passwordActual.value || !passwordNueva.value || !passwordRepetida.value) {
    error.value = "Por favor, rellena todos los campos.";
    return;
  }
  if (passwordNueva.value.length < 8) {
    error.value = "La contraseña nueva debe tener al menos 8 caracteres.";
    return;
  }
  if (passwordNueva.value !== passwordRepetida.value) {
    error.value = "Las contraseñas nuevas no coinciden.";
    return;
  }
  error.value = "";

  try {
    await usuarioRepository.cambiarPassword(
      authStore.id,
      passwordActual.value,
      passwordNueva.value,
    );
    // Se guardan las credenciales nuevas para que la sesión siga funcionando
    authStore.actualizarPassword(passwordNueva.value);
    exito.value = "Contraseña cambiada correctamente.";
    passwordActual.value = "";
    passwordNueva.value = "";
    passwordRepetida.value = "";
  } catch (err) {
    error.value =
      "No se pudo cambiar la contraseña. Revisa que la contraseña actual sea correcta.";
  }
}
</script>

<template>
  <div class="cambiar-password">
    <div class="cambiar-password__wrapper">
      <h1>Cambiar contraseña</h1>
      <p class="cambiar-password__subtitle">
        Por seguridad, necesitamos tu contraseña actual.
      </p>

      <div class="cambiar-password__box">
        <form class="cambiar-password__form" @submit.prevent="handleSubmit">
          <label for="password-actual">Contraseña actual</label>
          <input
            type="password"
            id="password-actual"
            placeholder="••••••"
            v-model="passwordActual"
          />

          <label for="password-nueva">Contraseña nueva</label>
          <input
            type="password"
            id="password-nueva"
            placeholder="Mínimo 8 caracteres"
            v-model="passwordNueva"
          />

          <label for="password-repetida">Repite la contraseña nueva</label>
          <input
            type="password"
            id="password-repetida"
            placeholder="••••••"
            v-model="passwordRepetida"
          />

          <p v-if="error" class="cambiar-password__error">{{ error }}</p>
          <p v-if="exito" class="cambiar-password__exito">{{ exito }}</p>

          <button type="submit" class="btn btn--primary">
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cambiar-password {
  background-color: var(--color-bg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 24px 20px 32px;
}

.cambiar-password__wrapper {
  max-width: 420px;
  width: 100%;
}

.cambiar-password h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.cambiar-password__subtitle {
  color: var(--color-text-muted);
  margin: 0 0 20px;
}

.cambiar-password__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.cambiar-password__form {
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

.cambiar-password__error {
  background-color: #fdecea;
  border: 1px solid #f5c6c0;
  color: #c0392b;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.cambiar-password__exito {
  background-color: #e8f5e9;
  border: 1px solid #b7dfb9;
  color: #2e7d32;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

@media (max-width: 480px) {
  .cambiar-password {
    padding: 16px 16px 24px;
  }

  .cambiar-password__box {
    padding: 18px;
  }
}
</style>